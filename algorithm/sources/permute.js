function permute(nums) {
  let result = [];

  function backtrack(curr, remaining) {
    // 当剩余数组为空时，将当前排列加入结果数组
    if (remaining.length === 0) {
      result.push(curr);
      return;
    }

    // 遍历剩余数组的每个元素，依次生成排列
    for (let i = 0; i < remaining.length; i++) {
      // 将当前元素加入到排列中
      let next = curr.concat(remaining[i]); 
      // 生成新的剩余数组
      let newRemaining = remaining.slice(0, i).concat(remaining.slice(i + 1));
      // 递归生成剩余元素的排列
      backtrack(next, newRemaining); 
    }
  }

  backtrack([], nums); // 初始排列为空，剩余数组为原始数组
  return result;
}

// 测试
console.log(permute([1, 2, 3]));