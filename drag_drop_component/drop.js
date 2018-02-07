$(function(){
    //页面初始化
    model.init();
});
var model=(function(){
    //用于保存操作过的步骤，以便实现恢复上一步，重做下一步的功能
    var codeArr = [],codeIndex = 0;
    //用于判断要修改的组件
    var cid = "";
    //最终返回的对象，内部含有之后定义的函数
    var model = {};
    //页面初始化
    model.init = function(){
        //读取保存的代码
        model.loadCode();
        //记录初始代码，保存在数组中
        codeArr.push(model.createDirtyCode());
        //初始化头部导航栏
        model.initHeader();
        //初始化左侧边栏
        model.initLeft();
        //初始化每一行的编辑按钮
        model.initRow();
        //初始化主体部分可以放置拖拽元素
        model.renderDrop();
        //初始化当鼠标移入组件可以显示编辑删除按钮
        model.editComponent();
        //监控浏览器宽度变化
        model.autoAdapt();
    };
    //初始化头部导航栏
    model.initHeader = function(){
        //顶部导航栏被点击触发不同的函数
        $("header>ul").click(function(e){
            //根据元素的id判断被点击的按钮
            switch (e.target.id){
                //编辑按钮
                case "btnHeaderEdit":
                    //如果当前为预览界面则删除预览界面
                    $("#browserBox").remove();
                    //编辑界面显示
                    $(".container").show();
                    //左侧边栏显示
                    $(".left-nav").show();
                    break;
                //预览按钮
                case "btnBrowser":
                    model.browser();
                    break;
                //生成代码按钮
                case "btnCreateCode":
                    //调用生成干净代码的方法
                    var cleanCode=model.createCode();
                    //弹出模态框
                    layer.open({
                        type: 1,
                        title:"以下为生成的干净代码(点击文字面板ctrl+a可以全选)",
                        skin: 'layui-layer-rim', //加上边框
                        area: ['700px', '500px'], //宽高
                        content: "<textarea  style='width:100%;resize: none;height:90%;'>"+cleanCode+"</textarea>"
                    });
                    break;
                //保存代码按钮
                case "btnSave":
                    model.saveCode();
                    break;
                //清空代码按钮
                case "btnClear":
                    //如果不是预览界面才执行
                    if($("#browserBox").length==0){
                        layer.confirm('确定要清空全部内容么？（包括保存内容，清空后不可恢复）', {
                            btn: ['确定','取消'] //按钮
                        }, function(){
                            //点击确定的回调函数
                            //清空保存在本地的代码
                            if(window.localStorage){
                                localStorage.clear();
                            }
                            //清空编辑界面、保存代码的数组，并重新在数组中压入初始空界面
                            $(".container").html("");
                            codeArr=[];
                            codeIndex=0;
                            codeArr.push(model.createDirtyCode());
                            layer.closeAll();
                        }, function(){
                            //点击取消的回调函数
                        });
                    }
                    break;
                //恢复上一步按钮
                case "btnLast":
                    //如果不是预览界面才执行
                    if($("#browserBox").length==0){
                        //确保还能有上一步进行返回
                        if(codeIndex-1>=0){
                            codeIndex--;
                            //用数组中保存的代码替换现在的代码
                            $(".container").replaceWith(codeArr[codeIndex]);
                            //重新初始化让元素可放置，可排序
                            model.renderDrop();
                            //重新解析页面但是不在数组中记录代码
                            model.onlyParse();
                        }
                    }
                    break;
                //重做下一步按钮
                case "btnNext":
                    //如果不是预览界面才执行
                    if($("#browserBox").length==0){
                        //确保还有下一步可以重做
                        if(codeIndex!=codeArr.length-1){
                            codeIndex++;
                            //用数组中保存的代码替换现在的代码
                            $(".container").replaceWith(codeArr[codeIndex]);
                            //重新初始化让元素可放置，可排序
                            model.renderDrop();
                            //重新解析页面但是不在数组中记录代码
                            model.onlyParse();
                        }
                    }
                    break;

            };
        })
    };
    //初始化左侧导航栏
    model.initLeft = function(){
        //初始化左侧手风琴效果
        $(".left-nav>.first-list>li>span").click(function(e){
            var dom=e.target;
            if($(dom).hasClass("up")){
                $(dom).removeClass("up").siblings("ul").hide();
            }else{
                $(".left-nav .up").removeClass("up").siblings("ul").hide();
                $(dom).addClass("up").siblings("ul").show();
            }
        })
        //初始化，使左边列表拖动按钮可拖动
        $(".second-list>li>span").draggable({
            helper: 'clone',
            stop:function(){
                //jqueryUI的未知bug，有时拖拽结束用于提示的背景色不消失，故采取此种方法去除
                $(".red").removeClass("red");
            }
        });
    }
    //初始化每一行的编辑按钮
    model.initRow = function(){
        //当鼠标移入每一行时，动态添加删除按钮
        var editBtn = `<div class="row-edit"><button class="row-delete">删除此行</button></div>`;
        $("body").on("mouseenter",".row-dirty",function(){
            $(this).prepend(editBtn);
        });
        $("body").on("mouseleave",".row-dirty",function(){
            $(this).find(".row-edit").remove();
        });
        $("body").on("click",".row-delete",function(){
            $(this).parent().parent().remove();
            //将此行删除后，记录此时页面的代码
            model.record();
        });
    }
    //初始化抓取浏览器宽度变化,在预览界面时，当屏幕宽度发生变化时，预览界面进行刷新
    model.autoAdapt = function(){
        var width="";
        $(window).resize(function(){
            if($("#browserBox").length!=0){
                width=$(window).width();
                var nowWidth=$(window).width();
                setTimeout(function(){
                    if(width==nowWidth){
                        $("#btnBrowser").click();
                    }
                },300)
            }
        })
    }
    //配置可放置元素,可排序元素
    model.renderDrop=function(){
        //初始化可排序元素
        $( ".container,.row,.row>div" ).sortable({
            helper: "clone",
            start:function( event, ui ) {
                //jqueryUI的排序和拖拽功能有冲突，故在排序时，手动设置不显示提示背景色
                $(".container,.row>div").droppable({
                    activeClass: "",
                    hoverClass:""
                })
            },
            stop:function( event, ui ) {
                //排序结束后手动设置恢复提示背景色
                $(".container,.row>div").droppable({
                    activeClass: "ui-state-hover",
                    hoverClass:"red"
                })
                //jqueryUI未知bug，拖拽结束后有时不自动删除动态添加的class，故手动删除
                $(".ui-droppable-hover").removeClass("ui-droppable-hover");
                $(".red").removeClass("red");
            },
            update:function( event, ui ) {
                //当因为排序使DOM发生改变时，记录此时页面代码
                model.record();
            }
        });
        //排序功能的辅助函数
        $( ".container,.row,.row>div" ).disableSelection();

        //初始化设置哪些元素可放置拖拽元素
        $(".container,.row>div").droppable({
            activeClass: "ui-state-hover",
            hoverClass:"red",
            //jqueryUI的拖拽功能不进行事件冒泡，但存在未知bug
            greedy: true,
            tolerance:"pointer",
            drop: function( event, ui ) {
                var dom=this;
                //判断拖动进来的类型
                if(ui.draggable.parent().parent()[0].id=="settle"){
                    //如果拖动进来的是布局设置
                    model.dropSettle(dom,event,ui);
                    model.record();

                }else if(ui.draggable.parent().parent()[0].id=="component"){
                    //如果拖动进来的是组件
                    model.dropComponent(dom,event,ui);
                };
            },
            over:function(){
                //jqueryUI未知bug，有时提示背景色不自动删除，故手动进行删除
                $(this).find(".red").length!=0?$(this).hasClass("red")?$(this).removeClass("red"):"":"";
            }
        })
    };
    //放置元素为布局（settle）内容
    model.dropSettle=function(dom,event,ui){
        //按空格进行切割
        var arr=ui.draggable.prev("input").val().split(" ");
        //如果以空格开头或结尾，或有连续空格，去掉数组中的空元素
        for (i=0;i<arr.length;i++) {
            if (arr[i] == "") {
                arr.splice(i,1);
                i--;
            }
        };
        //计算数组中数字的和
        var count=0;
        for(var i=0;i<arr.length;i++){
            count+=Number(arr[i]);
        };
        //如果和为12插入布局，否则弹出提示框
        if(count==12){
            var html="";
            for(var i=0;i<arr.length;i++){
                html+="<div class='span-dirty span"+arr[i]+"'></div>"
            }
            $(dom).append("<div class='row row-dirty'>"+html+"</div>");

            //以下为同一列元素等高
            /*if(!$(this).hasClass("container")){
             $(this).siblings().css("height",$(this).css("height"));
             var parent=$(this).parent().parent();
             while(!parent.hasClass("container")){
             parent.siblings().css("height",parent.css("height"));
             parent=parent.parent().parent();
             }
             }*/

            //以下为可以调整元素大小
            /*   $(this).children().children().resizable({
             containment: $(this),
             stop: function( event, ui ) {
             console.log(ui)
             }
             });*/
            model.renderDrop();
        }else{
            alert("数字和必须等于12");
        }
    };
    //放置元素为组件（component）内容
    model.dropComponent=function(dom,event,ui){
        var str=ui.draggable.prev("input").val();
        //判断组件类型
        switch (str){
            case "图表组件":
                var html=model.makeChart();
                $(dom).append(html);
                //解析页面（组件的自定义标签）并在解析完毕后，在数组中记录当前页面代码
                model.parseHtml();
        }
    };
    //生成图表的html（包括含有未解析自定义标签的隐藏域）
    model.makeChart=function(options){
        //生成配置项
        var options=options||{
                area : ["100%",300],
                chartTitle : "销量图",
                type : "bar",
                chartX : ["可乐","雪碧","美年达","脉动","北冰洋"],
                chartY : "",
                chartData : [
                    {
                        name : "2017年",
                        data : [100, 80, 60, 40, 20]
                    }
                ]
            };
        //将对象变为字符串
        var dataOptions=JSON.stringify(options);
        //组件的html代码
        var componentHtml="<cb-chart data-options='"+dataOptions+"'></cb-chart>";
        //保存组件代码的隐藏域
        var copyHtml="<textarea class='hide'>"+componentHtml+"</textarea>";
        //将组件和隐藏域统一放在一个class为component-box的容器中(方便进行其他功能扩展，以及一些其他操作)
        var html="<div class='component-box'>"+componentHtml+copyHtml+"</div>";
        return html;
    }
    //解析自定义标签,保存此步操作(因生成，改变自定义标签内容时均需要重新解析，所以为了方便日后扩展其他组件，
    // 避免每次都手动调用model.record()函数，将之统一放在解析函数内自动触发)
    model.parseHtml=function(){
        //解析标签(默认从body开始解析)
        ParsingHelper.parsingTag();
        //二次解析标签
        ParsingHelper.parsinghtml($("body"));
        //标签解析完毕后，进行事件绑定与校验绑定
        InitModal.initHtml($("body"));
        //一些页面加载后进行的事件额外处理
        BindEvent.bindCommentEvent();
        //校验事件的加载
        CheckHelper.bindCheckEvent();
        //记录此时的页面,推入记录的数组，以便实现恢复上一步，重做下一步功能
        model.record();
    }
    //只解析标签不在记录数组中保存此步操作
    model.onlyParse=function(){
        //解析标签(默认从body开始解析)
        ParsingHelper.parsingTag();
        //二次解析标签
        ParsingHelper.parsinghtml($("body"));
        //标签解析完毕后，进行事件绑定与校验绑定
        InitModal.initHtml($("body"));
        //一些页面加载后进行的事件额外处理
        BindEvent.bindCommentEvent();
        //校验事件的加载
        CheckHelper.bindCheckEvent();
    }
    // 当鼠标移入组件 动态添加 编辑 删除 按钮
    model.editComponent = function(){
        var editBtn = `<div class="edit"><button>编辑</button><button>删除</button></div>`;
        $("body").on("mouseenter",".component-box",function(){
            $(this).prepend(editBtn);
        });
        $("body").on("mouseleave",".component-box",function(){
            $(".edit").remove();
        });
        $("body").on("click",".edit>button",function(){
            if(this.innerHTML == "编辑"){
                // 隐藏并清空 之前的编辑框
                if($(".bottom-nav").css("display")=="block"){
                    $(".configuration").html("");
                    $(".bottom-nav").hide();
                }
                // 当前组件的cid赋值到model内部的cid中保存，供后续通过cid取其配置项
                cid=$(this).parent().next().attr("cid");
                // todo: 组件类型与编辑按钮的绑定（根据tagtype显示不同组件[后续开发]的编辑框）
                var tagtype = $(this).parent().next().attr("tagtype");
                if(tagtype=="cb-chart"){
                    model.chartConfiguration($(this).parent().siblings(".hide"));
                }
                $(".bottom-nav").show();
            }else if(this.innerHTML == "删除"){
                $(this).parent().parent().remove();
                $(".bottom-nav").hide();
                // 记录删除操作
                model.record();
            }
        })
    };
    // 根据底部编辑栏内容，更改图表（图表编辑框）
    model.chartConfiguration = function(sourceCode){
        var chart = {
          configuration : `<div class="tabs">
                                <ul>
                                    <li><a href="#tabs-1">基本配置项</a></li>
                                    <li><a href="#tabs-2">数据配置</a></li>
                                </ul>
                                <div id="tabs-1">
                                    <ul class="base-list configuration-list">

                                    </ul>
                                </div>
                                <div id="tabs-2">
                                    <h3>chartData（数据录入）</h3>
                                    <div class="axis-dataFormat">
                                        主坐标轴标签名:
                                        <input type="text" class="item axis-data" value="">
                                        <span>将每一项用“-”隔开</span>
                                        <span style="color: red">（注意：此项与数据项一一对应）</span>
                                    </div>
                                    <ul class="data-list configuration-list">
                                    </ul>
                                    <button class="add-group">增加一组数据</button>
                                </div>
                            </div>`,
          baseList : `<input type="hidden" class="item cid" value="">
                      <li>图表类型：
                          <select class="item type" id="">
                              <option value="bar">bar(柱状)</option>
                              <option value="line">line(折线)</option>
                              <option value="scatter">scatter(散点)</option>
                              <option value="pie">pie(饼状)</option>
                              <option value="k">k线</option>
                              <option value="radar">radar(雷达)</option>
                              <option value="funnel">funnel(漏斗)</option>
                          </select>
                      </li>
                      <li>图表标题： <input type="text" class="item chartTitle" value=""></li>
                      <li>
                          宽度： <input type="text" class="item area-width" value="">
                          高度： <input type="text" class="item area-height" value="">
                      </li>
                      <li>
                          主坐标轴：
                          <select class="axis-type" >
                              <option value="x">X轴</option>
                              <option value="y">Y轴</option>
                          </select>
                      </li>`,
          format1 : `<li>
                        <span class="data-group">组：</span>
                        组名：<input type="text" class="item data-name" value="">
                        类型：<select class="item data-type">
                                <option value="bar">bar</option>
                                <option value="scatter">scatter</option>
                                <option value="line">line</option>
                              </select>
                        数据：<input type="text" class="item chart-data" value="">
                        <span>将每一项用“-”隔开</span>
                        <button class="delete-group">删除</button>
                    </li>`,
          format2 : `<li>
                            <span class="data-group"></span>
                            组名：<input type="text" class="item data-name" value="">
                            数据：<input type="text" class="item chart-data" value="">
                            <span>将每一项用“-”隔开</span>
                        </li>`,
          format3 : `<li>
                            <span class="data-group"></span>
                            组名：<input type="text" class="item data-name" value="">
                            数据：<input type="text" class="item chart-data" value="">
                            <span>将每一项用“-”隔开</span>
                            <button class="delete-group">删除</button>
                        </li>`,
          kInit : `<li class="data-group k-data-group">
                      轴项：<input type="text" class="k-name" value="2014">
                      数据：<input type="text" class="k-data" value="20-30-10-40">
                      <button class="delete-k-group">删除</button>
                    </li>
                    <li class="data-group k-data-group">
                      轴项：<input type="text" class="k-name" value="2015">
                      数据：<input type="text" class="k-data" value="60-30-10-94">
                      <button class="delete-k-group">删除</button>
                    </li>
                    <li class="data-group k-data-group">
                      轴项：<input type="text" class="k-name" value="2016">
                      数据：<input type="text" class="k-data" value="64-98-20-30">
                      <button class="delete-k-group">删除</button>
                    </li>
                    <li class="data-group k-data-group">
                      轴项：<input type="text" class="k-name" value="2017">
                      数据：<input type="text" class="k-data" value="50-30-95-59">
                      <button class="delete-k-group">删除</button>
                    </li>`,
          kInitItem : `<li class="data-group k-data-group">
                          轴项：<input type="text" class="k-name">
                          数据：<input type="text" class="k-data">
                          <button class="delete-k-group">删除</button>
                        </li>`,
          dataFormat : "",
          kAxis : [],
          kDataArr : [],
          code : $(sourceCode[0].textContent),
          options : {},
          init : function(){
            // 初始化的 bottom-nav
            $(".configuration").html(chart.configuration);
            $(".tabs").tabs({active: 0});
            // 获取组件的现存类型，从而判断数据输入格式
            var codeType = chart.code.data("options").type;
            chart.initBase(codeType);
            chart.initData(codeType);
            chart.initHtmlBtn();
            chart.listenType();
          },
          // 初始化 基本配置项
          initBase: function(codeType){
            $(".base-list").html("").append(chart.baseList);
            // 给 bottom-nav中的隐藏域的cid项赋值
            $(".bottom-nav .configuration-list .cid").attr("value",$(this).parent().next().attr("cid"));
            // 从隐藏域中取出各配置项放入对应位置
            $(".type").val(codeType);
            $(".chartTitle").val(chart.code.data("options").chartTitle);
            $(".area-width").val(chart.code.data("options").area[0]);
            $(".area-height").val(chart.code.data("options").area[1]);
            if(chart.code.data("options").chartX){
              $(".axis-type").val("x");
              // $(".axis-data").val(code.data("options").chartX.join("-"));
            }else if(chart.code.data("options").chartY){
              $(".axis-type").val("y");
              // $(".axis-data").val(code.data("options").chartY.join("-"));
            }
          },
          // 初始化 type 以及 数据填充类型
          initData : function(codeType){
            if(codeType=="bar" || codeType=="line" || codeType=="scatter"){
              chart.dataFormat = chart.format1;
              $(".add-group").css("display","block");
              $(".add-group").unbind("click");
              // 折柱散点图 可以添加组项
              $(".add-group").bind("click",function(){
                $(".data-list").append(chart.dataFormat);
                // 新增组项中的type类型为基本配置项中已保存的type类型
                $(".data-type").last().value = $(".type").val();
              });
            }else if(codeType=="pie" || codeType=="funnel"){
              // 主轴改变 禁用(只能用chartX)
              $(".axis-type").val("x");
              $(".axis-type").prop("disabled","true");
              chart.dataFormat = chart.format2;
              $(".add-group").css("display","none");
            }else if(codeType=="radar"){
              // 主轴改变 禁用(只能用chartX)
              $(".axis-type").val("x");
              $(".axis-type").prop("disabled","true");
              chart.dataFormat = chart.format3;
              $(".add-group").unbind("click");
              $(".add-group").bind("click",function(){
                $(".data-list").append(chart.dataFormat);
              });
            }else if(codeType=="k"){
              // 主轴改变 禁用
              $(".axis-type").val("x");
              $(".axis-type").prop("disabled","true");
              $(".add-group").css("display","none");
            }
            chart.fillItem();
          },
          // 数据格式填充，并从隐藏域中取出数据配置项放入对应位置，填充原有配置项
          fillItem : function(){
            // 轴项 配置项 显示
            $(".axis-dataFormat").show();
            // 添加 数据输入配置项
            $(".data-list").html("");
            // 对已有轴项的填充
            if(chart.code.data("options").chartX){
              // $(".axis-type").val("x");
              $(".axis-data").val(chart.code.data("options").chartX.join("-"));
            }else if(chart.code.data("options").chartY){
              // $(".axis-type").val("y");
              $(".axis-data").val(chart.code.data("options").chartY.join("-"));
            }
            // 对已有数据的填充
            if($(".type").val()=="line"||$(".type").val()=="scatter"||$(".type").val()=="bar"){
              // 获取原有的数据进行填充
              for (var item in chart.code.data("options").chartData) {
                $(".data-list").append(chart.dataFormat);
                $(".data-name")[item].value = chart.code.data("options").chartData[item].name;
                if ($(".data-type")[item]) {
                  $(".data-type")[item].value = chart.code.data("options").chartData[item].type ? chart.code.data("options").chartData[item].type : $(".type").val();
                }
                $(".chart-data")[item].value = chart.code.data("options").chartData[item].data.join("-");
              }
              // 折柱散点图 可以删除组项
              $(".data-list").on("click",".delete-group",function(){
                // 判断 此时组项数，当大于1时才可以删除
                if($(this).parent().parent().children().length>1){
                  $(this).parent().remove();
                }else{
                  layer.open({
                    content: "组项至少有一组！"
                  });
                }
              });
            }else if($(".type").val()=="pie"||$(".type").val()=="funnel"){
              $(".data-list").append(chart.dataFormat);
              $(".data-name").val(chart.code.data("options").chartData[0].name);
              $(".chart-data").val(chart.code.data("options").chartData[0].data.join("-"));
            }else if($(".type").val()=="radar"){
              for(var item in chart.code.data("options").chartData){
                  $(".data-list").append(chart.dataFormat);
                  $(".data-name")[item].value = chart.code.data("options").chartData[item].name;
                  $(".chart-data")[item].value = chart.code.data("options").chartData[item].data.join("-");
              }
              // 雷达图 可以删除组项
              $(".data-list").on("click",".delete-group",function(){
                if($(this).parent().parent().children().length>1){
                  $(this).parent().remove();
                }else{
                  layer.open({
                    content: "组项至少有一组！"
                  });
                }
              });
            }else if($(".type").val()=="k"){
              // 隐藏 轴项 配置项
              $(".axis-dataFormat").hide();
              $(".data-list").append(`<button class="k-model">配置K线图数据</button>`);
              $(".k-model").unbind("click");
              $(".k-model").bind("click",function(){
                //弹出模态框 配置K线图
                var layerIndex = layer.open({
                  type: 1,
                  title:"K线图 配置项",
                  skin: 'layui-layer-rim', //加上边框
                  area: ['700px', '500px'], //宽高
                  btn: ['完成配置'],
                  content: `<div class="k-container">
                                  <h4>每一轴项对应一组数据（注意：数据用“-”隔开）：</h4>
                                  <h4>如： 轴项：2017年5月    数据：20-30-10-35</h4>
                                  <button class="add-k-group">新增轴项</button>
                                  <ul class="k-list"></ul>
                                  <span class="k-bottom-tip">K线图chartData的数据格式为二维数组，其中每个数组代表一组数据，详情参见<a href="http://47.95.21.182/components/src/documents/cb-chart-demo/cb-chart-demo.html" style="color: #007FFF">图表绘制组件文档</a></span>
                                </div>`,
                  // 模态框 成功弹出后的回调函数
                  success:function(dom,index){
                    // 若 所编辑图 本就是k线图，则从原图中取出数据对页面进行填充
                    if(chart.code.data("options").type=="k"){
                      for (var item in chart.code.data("options").chartData[0].data) {
                        $(".k-list").append(chart.kInitItem);
                        $(".k-data")[item].value = chart.code.data("options").chartData[0].data[item].join("-");
                      }
                      // 当 为K线图时，不存在x,y轴互换，只有chartX有效，故此时轴项一定在chartX中，故不用判断直接遍历chartX
                      for(var item in chart.code.data("options").chartX){
                        $(".k-name")[item].value = chart.code.data("options").chartX[item];
                      }
                    }else{
                      // 若 所编辑图 本不是K线图，则初始化K线图数据的初始格式
                      $(".k-list").append(chart.kInit);
                    }
                  },
                  // 点击完成配置后的回调函数
                  yes:function(index){
                    // 完成配置 后 遍历保存
                    for(var item of $(".k-data-group")){
                      chart.kAxis.push($(item).children(".k-name").val());
                      chart.kDataArr.push($(item).children(".k-data").val().split("-").map(function(val){return Number(val)}));
                    }
                    layer.close(index);
                  }
                });
                layer.style(layerIndex,{
                  background: '#ccc',
                  fontSize: "medium"
                });
                // 禁止模态框出现滚动条
                $(".k-container").parent().css("overflow","hidden");
                // 为避免错误，事件绑定之前首先解绑
                $(".add-k-group").unbind("click");
                $(".delete-k-group").unbind("click");
                $(".add-k-group").bind("click",function(){
                  $(".k-list").append(chart.kInitItem);
                });
                $(".delete-k-group").bind("click",function(){
                  $(this).parent().remove();
                });
              });
            }
          },
          // 初始化 配置框 中的关闭和确定的按钮的绑定事件
          initHtmlBtn : function(){
            // 对之前的 绑定解绑（否则会有多个事件被触发）
            $(".bottom-nav .bottom-nav-close").unbind("click");
            $(".bottom-nav .update").unbind("click");
            // 关闭按钮 隐藏
            $(".bottom-nav .bottom-nav-close").bind("click",function(){
              //  关闭配置框时，将原有的列表项内容清空
              $(".configuration").html("");
              $(".bottom-nav").hide();
            });
            // 点击 确定 按钮后 从页面中的配置项取值，进行重新绘图
            $(".bottom-nav .update").bind("click",function(){
              if($(".type").val()=="k"&&chart.kDataArr.length==0){
                  layer.open({content: "请填写配置项，并点击 完成配置 按钮"});
              }else{
                var width =  $(".area-width").val() ? $(".area-width").val() : 300;
                var height = $(".area-height").val() ? Number($(".area-height").val()) : 300;
                // if(chart)
                var axisData = chart.kAxis.length!=0 ? chart.kAxis : $(".axis-data").val() ? $(".axis-data").val().split("-") :["可乐","雪碧","美年达","脉动","北冰洋"];
                var chartData = [];
                if($(".type").val()=="k"){
                  var info = {};
                  info.type = "k";
                  info.data = chart.kDataArr;
                  chartData.push(info);
                }else{
                  $(".data-group").map(function(){
                    var info = {};
                    // 当有chart-data数据填充时，才去找type,name配置项，否则只有name而没有数据，图表加载会出错
                    if($(this).siblings(".chart-data").val()){
                      info.data = $(this).siblings(".chart-data").val().split("-").map(function(val){
                        return Number(val);
                      });
                      if($(this).siblings(".data-name").val()){
                        info.name = $(this).siblings(".data-name").val();
                      }
                      if($(this).siblings(".data-type").val()){
                        info.type = $(this).siblings(".data-type").val();
                      }
                    }
                    // 如果info不为空，则push
                    if(JSON.stringify(info) != "{}"){
                      chartData.push(info);
                    };
                  });
                }
                chart.options = {
                  area : [width, height],
                  chartTitle : $(".chartTitle").val() ? $(".chartTitle").val() : "销量图",
                  type : $(".type").val() ? $(".type").val() : "bar",
                  chartX : $(".axis-type").val()=="x" ? axisData : "",
                  chartY : $(".axis-type").val()=="y" ? axisData : "",
                  chartData : chartData.length!=0 ? chartData :
                    [{
                      name: "2017年",
                      data: [100, 80, 60, 40, 20]
                    }]
                };
                if(chart.options.type=="line" ||chart.options.type=="bar" ||chart.options.type=="scatter"){
                  chart.code.data("options").chartData = chart.code.data("options").chartData.map(function(val){
                    val.type ? val.type : val.type = chart.code.data("options").type;
                    return val;
                  });
                }
                console.log(JSON.stringify(chart.code.data("options")));
                console.log(JSON.stringify(chart.options));
                console.log(JSON.stringify(chart.options)==JSON.stringify(chart.code.data("options")));
                //JSON.stringify(chart.code.data("options"))!=JSON.stringify(chart.options)
                if(!equals(chart.options,chart.code.data("options"))){
                  // 更新图表配置项
                  var html=model.makeChart(chart.options);
                  // 替换原图表
                  var dom = $("[cid="+cid+"]").parent();
                  $(dom).replaceWith(html);
                  model.parseHtml();
                }
                //  完成配置后时，将原有的列表项内容清空
                $(".data-list").html("");
                $(".bottom-nav").hide();
              }
            });
          },
          // 点击 确定 时，判断配置项是否发生改变，若未改变则不刷新（经过优化后不再调用）
          isRefresh : function(){
            var result1,result2,result3,result4;
            // 判断基本配置项是否改变
            if($(".type").val()==chart.code.data("options").type && $(".chartTitle").val()==chart.code.data("options").chartTitle && $(".area-width").val()==chart.code.data("options").area[0] && $(".area-height").val()==chart.code.data("options").area[1]){
              result1 = true;
            }else{
              result1 = false;
            }
            // 判断主轴以及轴项是否改变
            if(chart.code.data("options").chartX){
              if(!($(".type").val()=="bar"||$(".type").val()=="line"||$(".type").val()=="scatter")){
                if($(".type").val()=="k"){
                  if(chart.kAxis==chart.code.data("options").chartX.join("-")){
                    result2 = true;
                  }else{
                    result2 = false;
                  }
                }else{
                  if($(".axis-data").val()==chart.code.data("options").chartX.join("-")){
                    result2 = true;
                  }else{
                    result2 = false;
                  }
                }
              }else if($(".type").val()=="bar"||$(".type").val()=="line"||$(".type").val()=="scatter"){
                if($(".axis-type").val()=="x" && $(".axis-data").val()==chart.code.data("options").chartX.join("-")){
                  result2 = true;
                }else{
                  result2 = false;
                }
              }
            }else if(chart.code.data("options").chartY){
              if(!($(".type").val()=="bar"||$(".type").val()=="line"||$(".type").val()=="scatter")){
                if($(".type").val()=="k"){
                  if(chart.kAxis==chart.code.data("options").chartY.join("-")){
                    result2 = true;
                  }else{
                    result2 = false;
                  }
                }else {
                  if ($(".axis-data").val() == chart.code.data("options").chartY.join("-")) {
                    result2 = true;
                  } else {
                    result2 = false;
                  }
                }
              }else if($(".type").val()=="bar"||$(".type").val()=="line"||$(".type").val()=="scatter"){
                if($(".axis-type").val()=="y" && $(".axis-data").val()==chart.code.data("options").chartY.join("-")){
                  result2 = true;
                }else{
                  result2 = false;
                }
              }
            }
            // 判断 数据项 是否改变
            if($(".type").val() == "bar"||$(".type").val() == "line"||$(".type").val() == "scatter"){
              if($($(".data-group")[0]).parent().parent().children().length==chart.code.data("options").chartData.length){
                // todo: 数据的遍历判断
                for(var item in chart.code.data("options").chartData){
                  $(".data-name")[item].value == chart.code.data("options").chartData[item].name &&
                  $(".data-type")[item].value == chart.code.data("options").chartData[item].type &&
                  $(".chart-data")[item].value == chart.code.data("options").chartData[item].data.join("-") ?
                    result3 = true : result3 = false;
                }
              }else{
                result3 = false;
              }
            }else if($(".type").val()=="radar"){
              if($($(".data-group")[0]).parent().parent().children().length==chart.code.data("options").chartData.length) {
                for (var item in chart.code.data("options").chartData) {
                  $(".data-name")[item].value == chart.code.data("options").chartData[item].name &&
                  $(".chart-data")[item].value == chart.code.data("options").chartData[item].data.join("-") ?
                    result3 = true : result3 = false;
                }
              }else{
                result3 = false;
              }
            }else if($(".type").val()=="pie"||$(".type").val()=="funnel"){
              if($(".data-name").val()==chart.code.data("options").chartData[0].name && $(".chart-data").val()==chart.code.data("options").chartData[0].data.join("-")){
                result3 = true;
              }else{
                result3 = false;
              }
            }else if($(".type").val()=="k"){
              if(chart.kDataArr==chart.code.data("options").chartData[0].data){
                result3 = true;
              }else{
                result3 = false;
              }
            }
            // 判断 数据项 长度是否改变
            chart.code.data("options").chartData.length == $(".data-group").length || $(".k-data-group").length ? result4 = true : result4 = false;
            var result = result1&&result2&&result3&&result4;
            console.log(result);
            return result;
          },
          // 监听 type 类型的改变，从而改变bottom-nav的数据输入格式 内容等
          listenType : function(){
            $(".bottom-nav").on("change",".configuration-list li>.type",function(){
              var type = $(".type").val();
              if(type=="line" || type=="bar" || type=="scatter"){
                // 主轴改变 可用
                $(".axis-type").removeAttr("disabled");
                // todo: 不同的图表 有不同的输入格式（改变html）
                chart.dataFormat = chart.format1;
                // 监听改变，改变时，页面刷新，数据重新从data-options中读取（以上配置重新执行）
                chart.fillItem();
                $(".add-group").css("display","block");
                $(".add-group").unbind("click");
                // 折柱散点图 可以添加组项
                $(".add-group").bind("click",function(){
                  // $(".bottom-nav .configuration-list li>.type").val();
                  $(".data-list").append(chart.dataFormat);
                  $(".data-type").last().value = $(".type").val();
                });
              }else if(type=="pie" || type=="funnel"){
                // 主轴改变 禁用(只能用chartX)
                $(".axis-type").val("x");
                $(".axis-type").prop("disabled","true");
                // 类型改变时，将原有的列表项内容清空
                chart.dataFormat = chart.format2;
                chart.fillItem();
                $(".add-group").css("display","none");
              }else if(type=="radar"){
                // 主轴改变 禁用(只能用chartX)
                $(".axis-type").val("x");
                $(".axis-type").prop("disabled","true");
                // 类型改变时，将原有的列表项内容清空
                chart.dataFormat = chart.format3;
                chart.fillItem();
                $(".add-group").css("display","block");
                $(".add-group").unbind("click");
                // 雷达图 可以添加组项
                $(".add-group").bind("click",function(){
                  // $(".bottom-nav .configuration-list li>.type").val();
                  $(".data-list").append(chart.dataFormat);
                });
              }else if(type=="k"){
                // 主轴改变 禁用(只能用chartX)
                $(".axis-type").val("x");
                $(".axis-type").prop("disabled","true");
                // 类型改变时，将原有的列表项内容清空
                chart.fillItem();
                $(".add-group").css("display","none");
              }
            });
          }
        };
        chart.init();
    };
    //生成干净可用的代码
    model.createCode=function(){
        //获取编辑界面中的代码
        var html=$(".container").html();
        //创建临时放置代码的隐藏域
        var hideArea="<div id='hideArea' class='hide'><div class='container'></div></div>";
        $("body").append(hideArea);
        //将代码放入隐藏域
        $("#hideArea>.container").html(html);
        //将保存的未解析代码，替换掉component-box容器（装有解析过代码及保存未解析代码的隐藏域）
        $("#hideArea>.container .component-box").each(function(i,val){
            var html=$(val).children("textarea").val();
            $(val).replaceWith(html);
        });
        //以下为删除代码中的多余代码
        $("#hideArea .ui-sortable-handle").removeClass("ui-sortable-handle");
        $("#hideArea .ui-sortable").removeClass("ui-sortable");
        $("#hideArea .ui-droppable").removeClass("ui-droppable");
        $("#hideArea .container-dirty").removeClass("container-dirty");
        $("#hideArea .span-dirty").removeClass("span-dirty");
        $("#hideArea .row-dirty").removeClass("row-dirty");
        //取出经过初步过滤的代码，并删除隐藏域
        var cleanCode=$("#hideArea").html();
        $("#hideArea").remove();
        //对代码进行二次过滤，解决浏览器自动将’变为“的问题
        cleanCode = cleanCode.replace(/style=""/g,"");
        cleanCode = cleanCode.replace(/"{/g,"'{");
        cleanCode = cleanCode.replace(/}"/g,"}'");
        //对干净代码进行格式化操作，方便进行阅读
        cleanCode = HTMLFormat(cleanCode);
        return cleanCode;
    }
    //生成用于保存的脏代码
    model.createDirtyCode = function(){
        //获取编辑界面中的代码
        var html=$(".container").html();
        //创建临时放置代码的隐藏域
        var hideArea="<div id='hideArea' class='hide'><div class='container container-dirty'></div></div>";
        $("body").append(hideArea);
        $("#hideArea>.container").html(html);
        //取出保存的未解析代码，替换掉解析过的代码
        $("#hideArea>.container textarea").each(function(i,val){
            var html=$(val).val();
            $(val).siblings().remove();
            $(val).before(html);
        });
        //以下为删除多余代码
        $("#hideArea .ui-sortable-handle").removeClass("ui-sortable-handle");
        $("#hideArea .ui-sortable").removeClass("ui-sortable");
        $("#hideArea .ui-droppable").removeClass("ui-droppable");
        $("#hideArea .ui-droppable-active").removeClass("ui-droppable-active");
        $("#hideArea .ui-state-hover").removeClass("ui-state-hover");
        //如果布局存在多层嵌套，删除内层布局行时，会把外层的删除此行按钮进行保存，故在此时删除
        $("#hideArea .row-edit").remove();
        //取出经过第一次过滤的代码，删除隐藏域
        var code=$("#hideArea").html();
        $("#hideArea").remove();
        //对代码进行二次加工
        code = code.replace(/style=""/g,"");
        code = code.replace(/"{/g,"'{");
        code = code.replace(/}"/g,"}'");
        code = code.replace(/&quot;/g,"\"");
        code = code.replace(/&lt;/g,"<");
        code = code.replace(/&gt;/g,">");
        //对代码进行格式化
        code = HTMLFormat(code);
        return code;
    }
    //生成预览页面
    model.browser=function(){
        //如果当前已经是预览界面，删除之前的预览界面
        if($("#browserBox").length!=0){
            $("#browserBox").remove();
        }
        $("body").children().hide();
        $("header").show();
        //取得干净代码
        var cleanCode=model.createCode();
        var html="<div id='browserBox' style='margin-top:40px;'>"+cleanCode+"</div>"
        $("body").append(html);
        //解析页面但不将此步操作保存在数组中
        model.onlyParse();
    }
    //保存代码
    model.saveCode=function(){
        //若底部编辑栏处于打开状态，先关闭底部编辑栏
        $(".configuration").html("");
        $(".bottom-nav").hide();
        //取得用于保存的脏代码
        var code=model.createDirtyCode();
        //判断浏览器是否支持本地保存
        if(window.localStorage){
            localStorage.setItem("code",code);
        }else{
            alert("浏览器不支持localStorage，请更换浏览器")
        }
    }
    //读取保存的代码
    model.loadCode=function(){
        //判断浏览器是否支持本地保存
        if(window.localStorage){
            var code = localStorage.getItem("code");
            if(code){
                $(".container").replaceWith(code);
                model.onlyParse();
            }
        }
    }
    //记录做过的步骤
    model.record=function(){
        //如果此时用于记录的数组下标不是数组的最后一位，则删除数组中对应下标之后的数据
        if(codeIndex!=codeArr.length-1){
            codeArr.splice(codeIndex+1);
        }
        //为了避免保存的代码过多，占用大量内存的情况，所以设置最多可以保存最近的10步操作
        if(codeArr.length<10){
            codeArr.push(model.createDirtyCode());
            codeIndex++;
        }else{
            codeArr.shift()
            codeArr.push(model.createDirtyCode());
        }
    }
    return model;
})()


