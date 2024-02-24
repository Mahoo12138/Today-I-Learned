function findMedianSortedArrays(nums1, nums2) {
  let nums = [];
  let m = nums1.length;
  let n = nums2.length;
  if (m == 0) {
      if (n % 2 == 0) {
          return (nums2[n / 2 - 1] + nums2[n / 2]) / 2.0;
      } else {

          return nums2[n / 2];
      }
  }
  if (n == 0) {
      if (m % 2 == 0) {
          return (nums1[m / 2 - 1] + nums1[m / 2]) / 2.0;
      } else {
          return nums1[m / 2];
      }
  }

  let count = 0;
  let i = 0, j = 0;
  while (count != (m + n)) {
      if (i == m) {
          while (j != n) {
              nums[count++] = nums2[j++];
          }
          break;
      }
      if (j == n) {
          while (i != m) {
              nums[count++] = nums1[i++];
          }
          break;
      }

      if (nums1[i] < nums2[j]) {
          nums[count++] = nums1[i++];
      } else {
          nums[count++] = nums2[j++];
      }
  }

  if (count % 2 == 0) {
      return (nums[count / 2 - 1] + nums[count / 2]) / 2.0;
  } else {
      return nums[Math.floor(count / 2)];
  }  
};

findMedianSortedArrays([1,3], [2])