"use strict";
const validator = {
  "name": {
    "rules": [
      {
        "required": true,
        "errorMessage": "{label}为必填项"
      },
      {
        "format": "string"
      },
      {
        "minLength": 2,
        "maxLength": 8
      }
    ],
    "label": "姓名",
    "title": "姓名"
  },
  "age": {
    "rules": [
      {
        "format": "double"
      },
      {
        "minimum": 18,
        "maximum": 35
      }
    ],
    "title": "年龄",
    "defaultValue": 18,
    "label": "年龄"
  },
  "gender": {
    "rules": [
      {
        "format": "int"
      },
      {
        "range": [
          {
            "text": "保密",
            "value": 0
          },
          {
            "text": "男",
            "value": 1
          },
          {
            "text": "女",
            "value": 2
          }
        ]
      }
    ],
    "title": "性别",
    "defaultValue": 0,
    "label": "性别"
  },
  "avatar": {
    "rules": [
      {
        "format": "file"
      }
    ],
    "title": "头像",
    "label": "头像"
  }
};
const enumConverter = {
  "gender_valuetotext": {
    "0": "保密",
    "1": "男",
    "2": "女"
  }
};
exports.enumConverter = enumConverter;
exports.validator = validator;
//# sourceMappingURL=../../../.sourcemap/mp-weixin/js_sdk/validator/demo-user.js.map
