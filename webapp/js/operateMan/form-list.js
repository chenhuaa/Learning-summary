/**
 * Created by zhaokun on 2018/1/8.
 */
$(function(){
  var searchStr=location.search.substring(1);
  var search=searchStr.split("&");
  var param={};
  for(var i=0;i<search.length;i++){
    var Arr=search[i].split("=");
    param[Arr[0]]=Arr[1];
  }
  var userName=decodeURI(param.userName);
  $(".title").html("结算实体名称："+userName);
  $.ajax({
    url:"../json/form-list.json",
    type:"get",
    data:{
      userName:userName,
      topMin:param.topMin,
      topMax:param.topMax,
      settlement:param.settlement
    },
    dataType:"json",
    success:function(data){
      if(data.respCode=="0000"){
        var dataId=parseInt(Math.random()*(5-1+1) + 1);
        var data=data["data"+dataId];
        var tbody=$('<tbody></tbody>');
        $(data).each(function(index){
          var val=data[index];
          var tr=$('<tr></tr>');
          tr.append(
            '<td>'+val.project+'</td>'+
            '<td>'+val.money+'</td>'
          );
          tbody.append(tr);
        })
        $('#list-table').append(tbody);
      }else{
        console.log("请求成功但返回数据出错");
      }
    }
  });
  $(".back-btn").click(function(){
    location.href="form-detail.html"
  });
})