/**
 * Created by zhaokun on 2018/1/8.
 */
$(function(){
  $(".calendar").click(function(){
    $(this).prev().click();
  });
  $(".date_box").dateDropper({
    animate: false,   //自动切换到当前日期
    format: 'Y-m',
    minYear: '1960',
    maxYear: '2100'
  });
  //获取当前时间，设置初始日期的截止月份为当前月份，起始月份为截止月份减5个月
  var nowDate=new Date();
  var maxYear=nowDate.getFullYear();
  var maxMonth=nowDate.getMonth()+1;
  if(maxMonth<5){
    var minMonth=maxMonth+12-4;
    var minYear=maxYear-1;
  }else{
    var minMonth=maxMonth-4;
    var minYear=maxYear;
  }
  maxMonth=maxMonth<10?"0"+maxMonth:maxMonth;
  minMonth=minMonth<10?"0"+minMonth:minMonth;
  $("#topMin").val(minYear+"-"+minMonth);
  $("#topMax").val(maxYear+"-"+maxMonth);
  //获取起始日期和结束日期时间区间发送给后台请求数据
  var topMin = $("#topMin").val();
  var topMax = $("#topMax").val();
  var settlement= $("#settlement").val();
  $.ajax({
    url:"../json/form-detail.json",
    type:"get",
    data:{topMin:topMin,topMax:topMax,settlement:settlement},
    dataType:"json",
    success:function(data){
      if(data.respCode=="0000"){
        var data=data["data"]["data1"];
          var tbody=$('<tbody></tbody>');
          $(data).each(function(index){
            var val=data[index];
            var tr=$('<tr></tr>');
            tr.append(
              '<td>'+val.userName+'</td>'+
              '<td>'+val.money+'</td>'+
              '<td>'+'<a href="form-list.html?topMin='+topMin+'&topMax='+topMax+'&settlement='+settlement+'&userName='+encodeURI(val.userName)+'">'+'详情</a>'+'</td>'
            );
            tbody.append(tr);
          })
          $('#detail-table').append(tbody);
      }else{
        console.log("请求成功但返回数据出错");
      }
    }
  });
  var dataId=2;
  $("#topMin,#topMax,#settlement").on("change",function(e){
    var target= e.target;
    var topMin= $("#topMin").val();
    var topMax= $("#topMax").val();
    if(target==$("#topMin")[0]){
      if(topMin>topMax){
        $("#topMin").val(topMax);
      }
    }else if(target==$("#topMax")[0]){
      if(topMin>topMax){
        $("#topMax").val(topMin);
      }
    }
    var topMin = $("#topMin").val();
    var topMax = $("#topMax").val();
    var settlement= $("#settlement").val();
    $.ajax({
      url:"../json/form-detail.json",
      type:"get",
      data:{topMin:topMin,topMax:topMax,settlement:settlement},
      dataType:"json",
      success:function(data){
        if(data.respCode=="0000"){
          var data=data["data"]["data"+dataId];
          var tbody=$('<tbody></tbody>');
          $(data).each(function(index){
            var val=data[index];
            var tr=$('<tr></tr>');
            tr.append(
              '<td>'+val.userName+'</td>'+
              '<td>'+val.money+'</td>'+
              '<td>'+'<a href="form-list.html?topMin='+topMin+'&topMax='+topMax+'&settlement='+settlement+'&userName='+encodeURI(val.userName)+'">'+'详情</a>'+'</td>'
            );
            tbody.append(tr);
          })
          $('#detail-table tbody').replaceWith(tbody);
          dataId=dataId<5?++dataId:1;
        }else{
          console.log("请求成功但返回数据出错");
        }
      }
    });
  })
})