import moment from "moment";
import redis_client from "../../redis_connect";
import { Real_Easte_News } from "../modules/real_easte_news/entities/real_easte_news.model"
import { User } from "../modules/user/entities/user.model";
moment.locale('vn')
export default{
    expirationRealEasteNews: async (id: string) => {
      console.log('SDSDDS: ',id);
        const news = await Real_Easte_News.findOneBy({id: id})
        const user = await User.findOneBy({id: news.user})
        news.status = 'Expiration'
        const date = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss')
        news.expiration_date = date
        await news.save()
        redis_client.HSET(`${`real-estate-news`}`,news.id,JSON.stringify(news))
        redis_client.HSET(`${user.email}:${`real-estate-news`}`,news.id,JSON.stringify(news))
        return news
    },
    sortObject: function sortObject(obj: Object) {
      let sorted = {};
      let str = [];
      let key;
      for (key in obj){
        if (obj.hasOwnProperty(key)) {
        str.push(encodeURIComponent(key));
        }
      }
      str.sort();
        for (key = 0; key < str.length; key++) {
            sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
        }
        return sorted;
    },

    price: function getPrice(price: string){
      let min: number = 0
      let max: number = 0
      switch (price){
        case '11': 
          max = 499999999
          min = 0
          break;
        case '12': 
          min = 500000000
          max = 800000000
          break
        case '13': 
          max = 1000000000
          min = 800000001
          break
        case '14': 
          min = 1000000000
          max = 2000000000
          break
        case '15': 
          min = 2000000000
          max = 3000000000
          break
        case '16': 
          min = 3000000000
          max = 5000000000
          break
        case '17': 
          min = 5000000000
          max = 7000000000
          break
        case '18': 
          min = 7000000000
          max = 10000000000
          break
        case '19': 
          min = 10000000000
          max = 20000000000
          break
        case '110': 
          min = 20000000000
          max = 30000000000
          break
        case '111': 
          min = 30000000000
          max = 40000000000
          break
        case '112': 
          min = 40000000000
          max = 60000000000
          break
        // case '113': 
        //   min = 20000000000
        //   max = 30000000000
        //   break
      }
      return {min,max}
    },

    acreage: function getPrice(acreage: string){
      let min: number = 0
      let max: number = 0
      switch (acreage){
        case 'l1': 
          max = 29.99
          min = 0
          break;
        case 'l2': 
          min = 30
          max = 49.9
          break
        case 'l3': 
          max = 50
          min = 79.9
          break
        case 'l4': 
          min = 80
          max = 9.9
          break
        case 'l5': 
          min = 100
          max = 149.9
          break
        case 'l6': 
          min = 150
          max = 199.9
          break
        case 'l7': 
          min = 200
          max = 249.9
          break
        case 'l8': 
          min = 250
          max = 299.9
          break
        case 'l9': 
          min = 300
          max = 500
          break
        case '110': 
          min = 20000000000
          max = 30000000000
          break
        case '111': 
          min = 30000000000
          max = 40000000000
          break
        case '112': 
          min = 40000000000
          max = 60000000000
          break
        // case '113': 
        //   min = 20000000000
        //   max = 30000000000
        //   break
      }
      return {min,max}
    }
}