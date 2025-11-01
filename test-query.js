#!/usr/bin/env node
/**
 * Test script for Claude Agent SDK Worker
 * Tests the /query endpoint with various queries
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var WORKER_URL = "https://claude-agent-worker.solovpxoffical.workers.dev";
var API_KEY = "y11";
function testQuery(query_1) {
    return __awaiter(this, arguments, void 0, function (query, accountId) {
        var startTime, response, duration, data, error_1, duration;
        if (accountId === void 0) { accountId = "default"; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log("\n\uD83D\uDCDD Testing query: \"".concat(query, "\""));
                    console.log("\uD83D\uDD10 Account: ".concat(accountId));
                    console.log("⏳ Sending request...\n");
                    startTime = Date.now();
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, fetch("".concat(WORKER_URL, "/query"), {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                                "Authorization": "Bearer ".concat(API_KEY),
                            },
                            body: JSON.stringify({
                                query: query,
                                accountId: accountId,
                            }),
                        })];
                case 2:
                    response = _a.sent();
                    duration = Date.now() - startTime;
                    console.log("\u23F1\uFE0F  Response time: ".concat(duration, "ms"));
                    console.log("\uD83D\uDCCA Status: ".concat(response.status, " ").concat(response.statusText));
                    return [4 /*yield*/, response.json()];
                case 3:
                    data = _a.sent();
                    if (response.ok) {
                        console.log("✅ Success!");
                        console.log("\uD83D\uDCE4 Response: ".concat(data.response || "No response"));
                    }
                    else {
                        console.log("❌ Error!");
                        console.log("\u274C Error message: ".concat(data.error || "Unknown error"));
                    }
                    return [3 /*break*/, 5];
                case 4:
                    error_1 = _a.sent();
                    duration = Date.now() - startTime;
                    console.log("\u23F1\uFE0F  Failed after: ".concat(duration, "ms"));
                    console.log("\u274C Request failed: ".concat(error_1 instanceof Error ? error_1.message : String(error_1)));
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    });
}
function testHealth() {
    return __awaiter(this, void 0, void 0, function () {
        var response, data, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log("\n🏥 Testing /health endpoint");
                    console.log("⏳ Sending request...\n");
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, fetch("".concat(WORKER_URL, "/health"))];
                case 2:
                    response = _a.sent();
                    return [4 /*yield*/, response.json()];
                case 3:
                    data = _a.sent();
                    console.log("✅ Health check passed!");
                    console.log("\uD83D\uDCCA Status: ".concat(data.status));
                    console.log("\uD83D\uDD11 Has API Key: ".concat(data.hasApiKey));
                    console.log("\uD83D\uDCE6 Has Container: ".concat(data.hasContainer));
                    console.log("\u23F0 Timestamp: ".concat(data.timestamp));
                    return [3 /*break*/, 5];
                case 4:
                    error_2 = _a.sent();
                    console.log("\u274C Health check failed: ".concat(error_2 instanceof Error ? error_2.message : String(error_2)));
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log("═══════════════════════════════════════════════════════════");
                    console.log("  Claude Agent SDK Worker - Test Suite");
                    console.log("═══════════════════════════════════════════════════════════");
                    console.log("\n\uD83C\uDFAF Worker URL: ".concat(WORKER_URL));
                    // Test health endpoint
                    return [4 /*yield*/, testHealth()];
                case 1:
                    // Test health endpoint
                    _a.sent();
                    // Test queries
                    console.log("\n═══════════════════════════════════════════════════════════");
                    console.log("  Running Query Tests");
                    console.log("═══════════════════════════════════════════════════════════");
                    return [4 /*yield*/, testQuery("What is 2+2?")];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, testQuery("Hello, how are you?")];
                case 3:
                    _a.sent();
                    return [4 /*yield*/, testQuery("Tell me a joke")];
                case 4:
                    _a.sent();
                    console.log("\n═══════════════════════════════════════════════════════════");
                    console.log("  Tests Complete!");
                    console.log("═══════════════════════════════════════════════════════════\n");
                    return [2 /*return*/];
            }
        });
    });
}
// Run tests
main().catch(console.error);
