export const initialPythonProgram = `from typing import List

class Solution:
    def twoSum(self, nums: List[int], target: int) -> List[int]:
        return [0, 1]

testCases = [
    ([2, 7, 11, 15], 9),
    ([3, 2, 4], 6),
    ([3, 3], 6),
]

for nums, target in testCases:
    if Solution().twoSum(nums, target) == [0, 1]:
        print("Pass")
    else:
        print("Fail")
`

export const initialGoProgram = `package main

import "fmt"

func main() {
	fmt.Println("Hello, World!")
}
`

export const getInitialProgram = (language?: string) => {
  switch (language) {
    case "python":
      return initialPythonProgram
    case "go":
      return initialGoProgram
    default:
      return initialPythonProgram
  }
}
