/**
 * Created by hywwb on 2018/1/8.
 * author：chenhua
 * description：$
 */
// 基于准备好的dom，初始化echarts实例
var myChart = echarts.init(document.getElementById('echarts-bar'));

var data = [ 20000, 17000, 15000, 13000, 10000];
// 配置项
option = {
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    containLabel: true
  },
  xAxis: {
    data: ['iPhoneX', '小米6', '荣耀8', 'vivoX20', 'oppoR11'],
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
myChart.setOption(option);