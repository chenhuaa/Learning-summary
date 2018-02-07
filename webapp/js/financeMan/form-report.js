/**
 * Created by hywwb on 2018/1/8.
 * author：chenhua
 * description：$
 */
//初始化页面
$(function(){
  // 点击日历图标 即 点击绑定时间插件的输入框
  $(".calendar").click(function(){
    $(this).prev().click();
  });
  // 为输入框绑定时间插件
  $(".date_box").dateDropper({
    animate: false,   // 是否使用动画 切换到当前日期
    format: 'Y-m',   // 日期的显示格式
    minYear: '1960',   // 最小最大 年份 限制
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
  // 设置 兑付金额TOP5的初始化的时间区间
  $("#modelMin").val(minYear+"-"+minMonth);
  $("#modelMax").val(maxYear+"-"+maxMonth);
  // 设置 结算金额TOP5的初始化的时间区间
  $("#topMin").val(minYear+"-"+minMonth);
  $("#topMax").val(maxYear+"-"+maxMonth);
  // 获取 兑付金额TOP5的 时间区间
  var modelMin = $("#modelMin").val();
  var modelMax = $("#modelMax").val();
  // 获取 结算金额TOP5的 时间区间
  var topMin = $("#topMin").val();
  var topMax = $("#topMax").val();
  // 获取 兑付金额TOP5的 兑付类型
  var payment=$("#payment").val();
  // 获取 结算金额TOP5的 结算类型
  var settlement= $("#settlement").val();
  // （假数据：数据改变后用不同的对象值）定义套数--初始为第一套，故改变从第二套开始
  var barFId=2;
  var barCId=2;
  
  // 页面初始的ajax请求（绘制图表）
  $.ajax({
    url: '../json/report.json',
    type: 'get',
    data: {modelMin:modelMin,modelMax:modelMax,topMin:topMin,topMax:topMax,settlement:settlement,payment:payment},
    dataType:'json',
    success: function(data){
      drawBar(data["bar-c"].bar1.data,data["bar-c"].bar1.xAxis,"accountTop5");
      drawBar(data["bar-f"].bar1.data,data["bar-f"].bar1.xAxis,"payTop5");
    },
    error: function(err){
      console.log(err);
    }
  });
  /**
   * 绘制柱状图 函数
   * @param data    x轴坐标项对应的数据
   * @param xAxis   x轴坐标项
   * @param dom    要绘制图表的dom对象（id值）
   */
  var drawBar = function(data,xAxis,dom){
    var myChart = echarts.init(document.getElementById(dom));
    
    var data = data;
    // 配置项
    option_bar = {
      tooltip : {
        trigger: 'axis',
        axisPointer: {
          type: 'none'
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        data: xAxis,
        axisTick: {
          show: false
        },
        axisLine: {
          show: false
        },
        axisLabel: {
          textStyle: {
            color: '#8C8C8C'
          },
          interval: 0
        }
      },
      yAxis: {
        axisLine: {
          show: false
        },
        axisTick: {
          show: false
        },
        axisLabel: {
          textStyle: {
            color: '#9C9C9C'
          }
        },
        splitLine: {
          show: false
        }
      },
      dataZoom: [
        {
          type: 'inside'
        }
      ],
      series: [
        {
          type: 'bar',
          barWidth: '40%',
          itemStyle: {
            normal: {
              barBorderRadius:[20, 20, 30, 30],
              color: new echarts.graphic.LinearGradient(
                0, 0, 0, 1,
                [
                  {offset: 0, color: '#8E90D0'},
                  {offset: 0.5, color: '#BFAFDF'},
                  {offset: 1, color: '#DCCAEA'}
                ]
              )
            },
            emphasis: {
              color: new echarts.graphic.LinearGradient(
                0, 0, 0, 1,
                [
                  {offset: 0, color: '#2378f7'},
                  {offset: 0.1, color: '#2378f7'},
                  {offset: 1, color: '#83bff6'}
                ]
              )
            }
          },
          data: data
        }
      ]
    };
    // 使用刚指定的配置项和数据显示图表。
    myChart.setOption(option_bar);
  };
  
  // 绑定日期改变的回调函数：兑付金额TOP5 的日期改变
  $("#modelMin,#modelMax,#payment").on("change",function(e){
    var target= e.target;
    // 获得时间区间
    var modelMin= $("#modelMin").val();
    var modelMax= $("#modelMax").val();
    // 时间区间 前者小于后者
    if(target==$("#modelMin")[0]){
      if(modelMin>modelMax){
        $("#modelMin").val(modelMax);
      }
    }else if(target==$("#modelMax")[0]){
      if(modelMin>modelMax){
        $("#modelMax").val(modelMin);
      }
    }
    // 再次获得可用时间区间及类型
    var modelMin = $("#modelMin").val();
    var modelMax = $("#modelMax").val();
    var topMin = $("#topMin").val();
    var topMax = $("#topMax").val();
    var settlement= $("#settlement").val();
    var payment=$("#payment").val();
    // 发起ajax请求
    $.ajax({
      url: '../json/report.json',
      type: 'get',
      data: {modelMin:modelMin,modelMax:modelMax,topMin:topMin,topMax:topMax,settlement:settlement,payment:payment},
      dataType:'json',
      success: function(data){
        // 根据返回数据绘制柱状图
        drawBar(data["bar-f"]["bar"+barFId].data,data["bar-f"]["bar"+barFId].xAxis,"payTop5");
        //（假数据：套数+1）
        barFId=barFId<5?++barFId:1;
      },
      error: function(err){
        console.log(err);
      }
    });
  });
  
  // 绑定日期及类型改变的回调函数：结算金额TOP5 的日期及类型改变
  $("#topMin,#topMax,#settlement").on("change",function(e){
    var target= e.target;
    // 获得时间区间
    var topMin= $("#topMin").val();
    var topMax= $("#topMax").val();
    // 时间区间 前者小于后者
    if(target==$("#topMin")[0]){
      if(topMin>topMax){
        $("#topMin").val(topMax);
      }
    }else if(target==$("#topMax")[0]){
      if(topMin>topMax){
        $("#topMax").val(topMin);
      }
    }
    // 再次获得可用时间区间及类型
    var modelMin = $("#modelMin").val();
    var modelMax = $("#modelMax").val();
    var topMin = $("#topMin").val();
    var topMax = $("#topMax").val();
    var settlement= $("#settlement").val();
    var payment=$("#payment").val();
    // 发起ajax请求
    $.ajax({
      url: '../json/report.json',
      type: 'get',
      data: {modelMin:modelMin,modelMax:modelMax,topMin:topMin,topMax:topMax,settlement:settlement,payment:payment},
      dataType:'json',
      success: function(data){
        // 根据返回数据绘制柱状图
        drawBar(data["bar-c"]["bar"+barCId].data,data["bar-c"]["bar"+barCId].xAxis,"accountTop5");
        // （假数据：套数+1）
        barCId=barCId<5?++barCId:1;
      },
      error: function(err){
        console.log(err);
      }
    });
  })
})

