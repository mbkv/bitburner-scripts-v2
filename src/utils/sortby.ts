export const sortby = <T extends object, K extends keyof T>(arr: T[], ...collection: K[]) => 
  arr.sort((a, b) => {
    for (const key of collection) {
      if (a[key] === b[key]) {
        continue;
      }

      if (a[key] < b[key]) {
        return -1;
      }

      return 1;
    }

    return 0;
  })
