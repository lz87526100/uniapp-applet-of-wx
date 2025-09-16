<template>
  <view class="uni-container">
    <uni-forms ref="form" :model="formData" validate-trigger="submit" err-show-type="toast">
      <uni-forms-item name="name" label="姓名" required>
        <uni-easyinput placeholder="请输入姓名" v-model="formData.name"></uni-easyinput>
      </uni-forms-item>
      <uni-forms-item name="age" label="年龄">
        <picker @change="pickerChange($event, 'age')" :range="formOptions.age_data" :value="formOptions.age_index">
          <view>{{formOptions.age_data[formOptions.age_index] || "请选择..."}}</view>
        </picker>
      </uni-forms-item>
      <uni-forms-item name="gender" label="性别">
        <uni-data-checkbox v-model="formData.gender" :localdata="formOptions.gender_localdata"></uni-data-checkbox>
      </uni-forms-item>
      <uni-forms-item name="avatar" label="头像">
        <uni-file-picker return-type="object" v-model="formData.avatar"></uni-file-picker>
      </uni-forms-item>
      <view class="uni-button-group">
        <button type="primary" class="uni-button" @click="submit">提交</button>
      </view>
    </uni-forms>
  </view>
</template>

<script>
  import { validator } from '../../js_sdk/validator/demo-user.js';

  const db = uniCloud.database();
  const dbCollectionName = 'demo-user';

  function getValidator(fields) {
    let result = {}
    for (let key in validator) {
      if (fields.indexOf(key) > -1) {
        result[key] = validator[key]
      }
    }
    return result
  }

  function numberRange(start, end) {
    return Array.from(new Array(end + 1).keys()).slice(start);
  }

  export default {
    data() {
      let formData = {
        "name": "",
        "age": 18,
        "gender": 0,
        "avatar": null
      }
      return {
        formData,
        formOptions: {
          "age_data": numberRange(18, 35),
          "age_index": 18,
          "gender_localdata": [
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
        },
        rules: {
          ...getValidator(Object.keys(formData))
        }
      }
    },
    onLoad(e) {
      if (e.id) {
        const id = e.id
        this.formDataId = id
        this.getDetail(id)
      }
    },
    onReady() {
      this.$refs.form.setRules(this.rules)
    },
    methods: {
      pickerChange(e, name) {
        this.formOptions[name + '_index'] = e.detail.value;
        this.formData[name] = this.formOptions[name + '_data'][e.detail.value];
        this.binddata(name, this.formData[name]);
      },
      /**
       * 验证表单并提交
       */
      submit() {
        uni.showLoading({
          mask: true
        })
        this.$refs.form.validate().then((res) => {
          return this.submitForm(res)
        }).catch(() => {
        }).finally(() => {
          uni.hideLoading()
        })
      },

      /**
       * 提交表单
       */
      submitForm(value) {
        // 使用 clientDB 提交数据
        return db.collection(dbCollectionName).doc(this.formDataId).update(value).then((res) => {
          uni.showToast({
            icon: 'none',
            title: '修改成功'
          })
          this.getOpenerEventChannel().emit('refreshData')
          setTimeout(() => uni.navigateBack(), 500)
        }).catch((err) => {
          uni.showModal({
            content: err.message || '请求服务失败',
            showCancel: false
          })
        })
      },

      /**
       * 获取表单数据
       * @param {Object} id
       */
      getDetail(id) {
        uni.showLoading({
          mask: true
        })
        db.collection(dbCollectionName).doc(id).field("name,age,gender,avatar").get().then((res) => {
          const data = res.result.data[0]
          if (data) {
            this.formData = data
            for (let key in this.formOptions) {
              let pickerIndex = key.lastIndexOf("_index")
              if (pickerIndex > -1) {
                let fieldName = key.substring(0, pickerIndex)
                let fieldData = this.formOptions[fieldName + "_data"];
                if (data[fieldName] && fieldData && fieldData.indexOf(data[fieldName]) > -1) {
                  this.formOptions[fieldName + "_index"] = fieldData.indexOf(data[fieldName])
                }
              }
            }
          }
        }).catch((err) => {
          uni.showModal({
            content: err.message || '请求服务失败',
            showCancel: false
          })
        }).finally(() => {
          uni.hideLoading()
        })
      }
    }
  }
</script>

<style>
  .uni-container {
    padding: 15px;
  }

  .uni-input-border,
  .uni-textarea-border {
    width: 100%;
    font-size: 14px;
    color: #666;
    border: 1px #e5e5e5 solid;
    border-radius: 5px;
    box-sizing: border-box;
  }

  .uni-input-border {
    padding: 0 10px;
    height: 35px;

  }

  .uni-textarea-border {
    padding: 10px;
    height: 80px;
  }

  .uni-button-group {
    margin-top: 50px;
    /* #ifndef APP-NVUE */
    display: flex;
    /* #endif */
    justify-content: center;
  }

  .uni-button {
    width: 184px;
  }
</style>
