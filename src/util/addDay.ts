
export default{
    addDay: async (date: Date, days: number) => {
        let result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
      }
}