"use strict";
const common_vendor = require("../common/vendor.js");
function isPermission(userid) {
  const { uid = "" } = common_vendor.tr.getCurrentUserInfo();
  if (uid == userid) {
    return true;
  } else {
    return false;
  }
}
exports.isPermission = isPermission;
//# sourceMappingURL=../../.sourcemap/mp-weixin/utils/common.js.map
