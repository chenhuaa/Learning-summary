/**
 * Created by hywwb on 2017/12/19.
 * author：chenhua
 * description：主函数为 fn，返回一个数组，该数组内是n个随机且不重复的整数，且整数的取值范围为 2-32
 */

var fn = function(n){
  let max=32,min=2;
  if(!Number(n) || !n || isNaN(n) || n>max || n<min || n%1!==0){   //todo:确保函数健壮性
    return "输入的 参数类型不正确！"
  }
  console.log("fn函数已调用，且通过判断");
  let arr = [];
  while(arr.length < Number(n)){   //n通过第一层过滤，此时n可能是number类型或可以转化成number的类型
    let num = getRandom(max,min);
    if(checkInArr(num,arr)){
      arr.push(num);
    }
  }
  if(!arr || arr.every(function(val,i,arr){return typeof arr[i]!=="number" || arr[i].toString()=="NaN"})){    //todo：此处注意 1、typeof NaN 为 number，故要单独对NaN进行判断；2、不能直接用 arr[i]===NaN，因为 NaN===NaN 为false，故应该将前后都转换为字符串形式再去比较！
    return [];
  }
  // console.log(arr);
  return "返回的数组有"+n+"个随机且不重复的整数："+arr;
}

/**
 * 产生 2-32 之间的随机数
 * @returns {number}
 */
let getRandom = function(max,min){
  return Math.floor(Math.random()*(max-min+1)+min);
}

/**
 * 检查num是否已存在于arr中
 * @param num {number}  随机数
 * @param arr  当前的数组
 * @returns {boolean}
 */
let checkInArr = function(num,arr){
  for(let val of arr){
    if(val===num){
      return false;
    }
  }
  return true;
}

console.log(111);

fn(30);
fn("6");