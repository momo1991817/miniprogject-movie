// pages/comment/comment.js
const db = wx.cloud.database()
Page({

      /**
       * 页面的初始数据
       */
      data: {
            detail: {},
            content: '',
            score: '5',
            previewImgs: [],
            fileids: [],
            commentid: -1
      },

      onFieldChange: function(event) {
            console.log(event.detail)
            this.setData({
                  content: event.detail
            })
      },
      onRateChange: function(event) {
            console.log(event.detail)
            this.setData({
                  score: event.detail
            })
      },
      uploadImg: function() {
            // 打开相册或照相机选择图片
            wx.chooseImage({
                  count: 9,
                  sizeType: ['original', 'compressed'],
                  sourceType: ['album', 'camera'],
                  success: res => {
                        // tempFilePath可以作为img标签的src属性显示图片
                        const tempFilePaths = res.tempFilePaths
                        this.setData({
                              previewImgs: this.data.previewImgs.concat(tempFilePaths)
                        })
                  }
            })
      },
      submit: function() {
            let promiseArr = []
            for (let i = 0; i < this.data.previewImgs.length; i++) {
                  promiseArr.push(new Promise((resolve, reject) => {
				let suffix = /\.\w+$/.exec(this.data.previewImgs[i]) [0]  //正则表达式，获取文件扩展名
                        wx.cloud.uploadFile({
					cloudPath: new Date().getTime() + suffix,
                              filePath: this.data.previewImgs[i], // 文件路径
                              success: res => {
                                    // get resource ID    
                                    this.setData({
                                          fileids: this.data.fileids.concat(res.fileID)
                                    })
                                    resolve()
                              },
                              fail: err => {
                                    // handle error
                              }
                        })

                  }))
            }
            Promise.all(promiseArr).then(res => {
                  db.collection('comment').add({
                        data: {
                              commentid: this.data.commentid,
                              content: this.data.content,
                              score: this.data.score,
                              fileids: this.data.fileids
                        }
                  }).then(res => {
                        console.log(this.data.fileids)
                        wx.showToast({
                              title: '提交成功',
                        })
                  })
            }).catch(err => {
                  console.log(err)
            })
      },
      /**
       * 生命周期函数--监听页面加载
       */
      onLoad: function(options) {
            this.setData({
                  commentid: options.id
            })
            wx.showLoading({
                  title: '加载中',
            })
            wx.cloud.callFunction({
                  name: 'comment',
                  data: {
                        movieid: options.id
                  }
            }).then(res => {
                  wx.hideLoading();

                  this.setData({
                        detail: JSON.parse(res.result)
                  })
                  console.log(this.data.detail)
            }).catch(err => {
                  console.log(err);
                  wx.hideLoading();
            })
      },

      /**
       * 生命周期函数--监听页面初次渲染完成
       */
      onReady: function() {

      },

      /**
       * 生命周期函数--监听页面显示
       */
      onShow: function() {

      },

      /**
       * 生命周期函数--监听页面隐藏
       */
      onHide: function() {

      },

      /**
       * 生命周期函数--监听页面卸载
       */
      onUnload: function() {

      },

      /**
       * 页面相关事件处理函数--监听用户下拉动作
       */
      onPullDownRefresh: function() {

      },

      /**
       * 页面上拉触底事件的处理函数
       */
      onReachBottom: function() {

      },

      /**
       * 用户点击右上角分享
       */
      onShareAppMessage: function() {

      }
})