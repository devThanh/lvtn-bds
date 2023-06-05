import { AuthService } from "./modules/auth/auth.service";
import { NewsService } from "./modules/news/news.service";
import { UserService } from "./modules/user/user.service";

export interface BaseService {}
export const authService = new AuthService()
export const userService = new UserService(authService)
export const newsService = new NewsService(authService)