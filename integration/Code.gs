/**
 * Google Apps Script - HWK COP17 Partnership Interest Form Receiver
 * 
 * Target Google Sheet Tab Name (Explicit):
 * hwk_partnership_form
 * 
 * Target Google Sheet Schema (Locked 7 Columns in Row 1):
 * id | Name | Organization | Email | I’m interested in… | Which HWK opportunity interests you? | Anything you’d like us to know?
 * 
 * Deployment Instructions:
 * 1. Open your target Google Sheet.
 * 2. Ensure a tab named "hwk_partnership_form" exists with the 7 columns in Row 1:
 *    [id, Name, Organization, Email, I’m interested in…, Which HWK opportunity interests you?, Anything you’d like us to know?]
 * 3. Click Extensions > Apps Script.
 * 4. Replace the script editor contents with this Code.gs code.
 * 5. Click Deploy > New Deployment.
 * 6. Select type: "Web app".
 * 7. Set Description: "HWK COP17 Partnership Form Receiver (Round 3.1A)".
 * 8. Execute as: "Me" (your Google account).
 * 9. Who has access: "Anyone" (essential for public form submissions).
 * 10. Click Deploy and copy the Web App URL (starts with https://script.google.com/macros/s/...).
 * 11. Paste that Web App URL into script.js at: const GOOGLE_APPS_SCRIPT_ENDPOINT = "YOUR_WEB_APP_URL";
 */

const SHEET_NAME = "hwk_partnership_form";

const ALLOWED_INTERESTS = [
  "Funding / Sponsorship",
  "Research / Expertise",
  "Institutional Partnership",
  "Youth / Education",
  "Other"
];

const ALLOWED_OPPORTUNITIES = [
  "Biodiversity in the Field",
  "Connected Waters",
  "Living Rangelands",
  "General Partnership"
];

/**
 * Formula Injection Protection:
 * Prevents execution of malicious formulas if cells begin with =, +, -, or @
 */
function sanitizeForSpreadsheet(val) {
  if (typeof val !== "string") return "";
  var trimmed = val.trim();
  if (trimmed.length === 0) return "";
  var firstChar = trimmed.charAt(0);
  if (firstChar === "=" || firstChar === "+" || firstChar === "-" || firstChar === "@") {
    return "'" + trimmed;
  }
  return trimmed;
}

/**
 * Escape JSON string for safe embedding within an HTML <script> block
 */
function escapeForScriptContext(str) {
  if (typeof str !== "string") return "";
  return str
    .replace(/&/g, '\\u0026')
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}

function createResponseOutput(responseObj) {
  var jsonStr = JSON.stringify(responseObj);
  var safeJsonStr = escapeForScriptContext(jsonStr);
  var html = '<!DOCTYPE html><html><head><meta charset="utf-8"><title>HWK Receiver</title></head><body>'
    + '<script>'
    + '(function(){'
    + '  var payload = ' + safeJsonStr + ';'
    + '  if (window.parent && window.parent !== window)'
    + '    window.parent.postMessage(payload, "*");'
    + '})();'
    + '</script>'
    + '</body></html>';
  return HtmlService.createHtmlOutput(html)
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function doPost(e) {
  var token = "";
  var lock = LockService.getScriptLock();
  var hasLock = false;

  try {
    // Acquire lock safely (up to 10s wait)
    try {
      hasLock = lock.tryLock(10000);
    } catch (lockAcquireErr) {
      hasLock = false;
    }

    // Extract payload from post data or form parameters
    var rawData = {};
    if (e && e.postData && e.postData.contents) {
      try {
        rawData = JSON.parse(e.postData.contents);
      } catch (jsonErr) {
        rawData = (e && e.parameter) ? e.parameter : {};
      }
    } else if (e && e.parameter) {
      rawData = e.parameter;
    }

    // Safe Token Validation: accept only bounded alphanumeric, underscore, hyphen characters
    var rawToken = (rawData.token || "").toString().trim();
    var safeTokenPattern = /^[a-zA-Z0-9_-]{1,100}$/;
    if (safeTokenPattern.test(rawToken)) {
      token = rawToken;
    } else {
      token = "";
    }

    if (!hasLock) {
      return createResponseOutput({
        source: "hwk-partnership-form",
        status: "error",
        token: token,
        message: "Server is currently busy. Please try again in a few moments."
      });
    }

    // Extract & Trim Raw Fields
    var rawName = (rawData.name || rawData.Name || "").toString().trim();
    var rawOrg = (rawData.organization || rawData.Organization || "").toString().trim();
    var rawEmail = (rawData.email || rawData.Email || "").toString().trim();
    var rawInterests = (rawData.interestedIn || rawData["I’m interested in…"] || rawData.interests || "").toString().trim();
    var rawOpp = (rawData.opportunity || rawData["Which HWK opportunity interests you?"] || "").toString().trim();
    var rawNotes = (rawData.notes || rawData["Anything you’d like us to know?"] || "").toString().trim();

    // Required Field Validations
    if (!rawName || !rawOrg || !rawEmail || !rawInterests) {
      return createResponseOutput({
        source: "hwk-partnership-form",
        status: "error",
        token: token,
        message: "Missing required fields. Name, Organization, Email, and Interests are required."
      });
    }

    // Length Validations - Reject oversized inputs (do not silently truncate)
    if (rawName.length > 120) {
      return createResponseOutput({
        source: "hwk-partnership-form",
        status: "error",
        token: token,
        message: "Name exceeds maximum allowed length of 120 characters."
      });
    }
    if (rawOrg.length > 180) {
      return createResponseOutput({
        source: "hwk-partnership-form",
        status: "error",
        token: token,
        message: "Organization exceeds maximum allowed length of 180 characters."
      });
    }
    if (rawEmail.length > 254) {
      return createResponseOutput({
        source: "hwk-partnership-form",
        status: "error",
        token: token,
        message: "Email exceeds maximum allowed length of 254 characters."
      });
    }
    if (rawNotes.length > 1000) {
      return createResponseOutput({
        source: "hwk-partnership-form",
        status: "error",
        token: token,
        message: "Notes exceed maximum allowed length of 1000 characters."
      });
    }

    // Email format validation
    var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(rawEmail)) {
      return createResponseOutput({
        source: "hwk-partnership-form",
        status: "error",
        token: token,
        message: "Invalid email format."
      });
    }

    // Allow-list validation for "I'm interested in..."
    var interestsList = rawInterests.split(",").map(function(item) {
      return item.trim();
    }).filter(function(item) {
      return item.length > 0;
    });

    if (interestsList.length === 0) {
      return createResponseOutput({
        source: "hwk-partnership-form",
        status: "error",
        token: token,
        message: "Please select at least one valid interest."
      });
    }

    // Strict validation: Reject entire submission if ANY interest is not in ALLOWED_INTERESTS
    var validInterests = [];
    for (var i = 0; i < interestsList.length; i++) {
      var interestItem = interestsList[i];
      if (ALLOWED_INTERESTS.indexOf(interestItem) === -1) {
        return createResponseOutput({
          source: "hwk-partnership-form",
          status: "error",
          token: token,
          message: "Invalid interest selection: '" + sanitizeForSpreadsheet(interestItem) + "' is not recognized."
        });
      }
      if (validInterests.indexOf(interestItem) === -1) {
        validInterests.push(interestItem);
      }
    }
    var cleanInterests = validInterests.join(", ");

    // Allow-list validation for "Which HWK opportunity interests you?" (OPTIONAL)
    // CRITICAL: Blank optional opportunity MUST remain blank in the sheet.
    var cleanOpportunity = "";
    if (rawOpp && rawOpp.length > 0) {
      if (ALLOWED_OPPORTUNITIES.indexOf(rawOpp) !== -1) {
        cleanOpportunity = rawOpp;
      } else {
        return createResponseOutput({
          source: "hwk-partnership-form",
          status: "error",
          token: token,
          message: "Invalid opportunity selection."
        });
      }
    }

    // Target Explicit Sheet Name
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) {
      return createResponseOutput({
        source: "hwk-partnership-form",
        status: "error",
        token: token,
        message: "Target sheet tab '" + SHEET_NAME + "' was not found in the spreadsheet."
      });
    }

    // Generate Unique Submission ID
    var timestamp = new Date();
    var id = "HWK-" + Utilities.formatDate(timestamp, "GMT+8", "yyyyMMdd-HHmmss") + "-" + Math.floor(100 + Math.random() * 900);

    // Append Row with Formula Injection Sanitization
    sheet.appendRow([
      id,
      sanitizeForSpreadsheet(rawName),
      sanitizeForSpreadsheet(rawOrg),
      sanitizeForSpreadsheet(rawEmail),
      cleanInterests,
      cleanOpportunity ? sanitizeForSpreadsheet(cleanOpportunity) : "",
      sanitizeForSpreadsheet(rawNotes)
    ]);

    // Return Server-Confirmed Success via Safe postMessage Output
    return createResponseOutput({
      source: "hwk-partnership-form",
      status: "success",
      token: token,
      id: id,
      message: "Thank you for connecting with Hiking with Knowledge. We’ve received your partnership interest and look forward to continuing the conversation."
    });

  } catch (err) {
    return createResponseOutput({
      source: "hwk-partnership-form",
      status: "error",
      token: token,
      message: "An error occurred while recording your response. Please contact hikingwithknowledge@gmail.com."
    });

  } finally {
    if (hasLock) {
      try {
        lock.releaseLock();
      } catch (lockReleaseErr) {}
    }
  }
}

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    source: "hwk-partnership-form",
    status: "active",
    sheet: SHEET_NAME,
    service: "HWK COP17 Partnership Form Receiver"
  })).setMimeType(ContentService.MimeType.JSON);
}

