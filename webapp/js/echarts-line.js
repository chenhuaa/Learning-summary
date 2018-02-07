/**
 * Created by hywwb on 2018/1/5.
 * author：chenhua
 * description：$
 */
// 基于准备好的dom，初始化echarts实例
var myChart = echarts.init(document.getElementById('echarts-line'));
// 配置项
option = {
  tooltip : {
    trigger: 'axis',
  },
  legend: {
    data:[
      {
        name: 'iPhone X',
        icon: 'rect',
        textStyle: {
          color: '#999999'
        }
      },
      {
        name: '小米6',
        icon: 'rect',
        textStyle: {
          color: '#999999'
        }
      },
      {
        name: '荣耀8',
        icon: 'rect',
        textStyle: {
          color: '#999999'
        }
      }
    ],
    x: 'right'
  },
  color: ['#F7AA4B','#FD57D5','#849BFD'],
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    containLabel: true
  },
  xAxis : [
    {
      type : 'category',
      boundaryGap : false,
      axisLine: {show: false},
      axisTick: {show: false},
      axisLabel: {
        textStyle: {
          color: '#8C8C8C'
        }
      },
      data : ['','1月','2月','3月','']
    }
  ],
  yAxis : [
    {
      type : 'value',
      axisLine: {show: false},
      axisTick: {show: false},
      axisLabel: {
        textStyle: {
          color: '#9C9C9C'
        }
      },
    }
  ],
  series : [
    {
      name:'iPhone X',
      type:'line',
      areaStyle: {normal: {
        color: '#FFF6DD'
      }},
      lineStyle: {
        normal: {
          color: '#F7AA4B',
          width: 7
        }
      },
      showSymbol: false,
      data:[15000, 22000, 17000, 20000, 18000]
    },
    {
      name:'小米6',
      type:'line',
      areaStyle: {normal: {
        color: '#FFDBF0'
      }},
      lineStyle: {
        normal: {
          color: '#FD57D5',
          width: 7
        }
      },
      showSymbol: false,
      data:[11000, 10000, 14000, 8000, 13000]
    },
    {
      name:'荣耀8',
      type:'line',
      areaStyle: {normal: {
        color: '#E5EDF8'
      }},
      lineStyle: {
        normal: {
          color: '#849BFD',
          width: 7
        }
      },
      showSymbol: false,
      data:[5000, 9000, 6000, 13000, 8000]
    }
  ]
};

// 使用刚指定的配置项和数据显示图表。
myChart.setOption(option);