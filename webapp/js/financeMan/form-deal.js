/**
 * Created by hywwb on 2018/1/8.
 * author：chenhua
 * description：$
 */
// 页面初始化  根据用户uid去查询待办事项，返回数据格如 json/deal.json
$(function(){
  var uid = 11111;
  // 发起ajax请求
  $.ajax({
    url: '../json/deal.json',
    type: 'get',
    data: {uid:uid},
    dataType:'json',
    success: function(data){
      // （假数据：套数）
      var dataId = parseInt(Math.random()*(5-1+1) + 1);
      var html = "";
      // 根据返回的数据 动态生成拼接项
      for(var i of data["detail_info"+dataId]){
        html += `<div class="rect">
                <input type="checkbox" value="${i.d_id}">
                <span class="detail_text">${i.text}</span>
                <span class="blue">详情 ></span>
            </div>
            <div class="hidden">
               ${i.info}
            </div>
            `;
      }
      $("div.detail_info").html(html);
      // 事件回调函数绑定：点击"详情"，显示详情
      $(".rect").on("click",".blue",function(){
        var show = $(this).parent().next().css('display');
        if(show == 'none'){
          $(this).html("详情 ∨");
          $(this).parent().next().show();
        }else{
          $(this).html("详情 >");
          $(this).parent().next().hide();
        }
      });
    },
    error: function(err){
      console.log(err);
    }
  });
  // 点击“审批通过”事件
  $(".pass_btn>.pass").on("click",function(){
    // getList("pass");
    console.log(getList("pass"));    //测试代码
    console.log("通过");
  });
  // 点击“审批不通过”事件
  $(".pass_btn>.not_go").on("click",function(){
    // getList("not_go");
    console.log(getList("not_go"));    //测试代码
    console.log("不通过");
  });
  
  /**
   * 获取待办项页面的选中值，将返回类型和选中项编号保存，最后移除选中项（已处理）
   * @param type：类型（表示返回值为通过 或 不通过的列表）
   * @returns {{type: string, list: Array}}
   */
  var getList = function(type){
    var a = $(".rect>input");
    var List = {"type":"","list":[]};
    List.type = type;
    for(var i of a){
      if($(i).prop("checked")){
        List.list.push($(i).attr("value"));
        if($(i).parent().next().hasClass("hidden")){
          $(i).parent().next().remove();
        }
        $(i).parent().remove();
      }
    }
    return List;
  } 
});


