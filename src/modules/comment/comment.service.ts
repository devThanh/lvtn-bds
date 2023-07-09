import redis_client from "../../../redis_connect";
import { ConnectDB } from "../../database/connection";
import { Errors } from "../../helpers/error";
import { BaseService } from "../../service";
import { Real_Easte_News } from "../real_easte_news/entities/real_easte_news.model";
import { Admin } from "../user/entities/admin.model";
import { User } from "../user/entities/user.model";
import { Comment } from "./entities/comment.model";
import moment from "moment";
import { Liked } from "./entities/like.model";
import { Pagination } from "../../helpers/response.wrapper";
import { Info_Real_Easte } from "../real_easte_news/entities/info_real_easte.model";
import { it } from "node:test";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3Client } from "../../helpers/s3";
import { GetObjectCommand } from "@aws-sdk/client-s3";
moment.locale('vn')
const dataSource = ConnectDB.AppDataSource


export class CommentService implements BaseService{
    getComment = async (commentId: string) => {
        const listComment = await Comment.find({
            where: { id: commentId },
        })
        return listComment
    }

    createComment = async (real_easte_detail_id: string,email: string, type: string, name: string,content: string) => {
        const user = await User.findOneBy({email: email, type: type})
        const countComment = await Comment.find({
            where: {
                user_id: user.id,
                real_easte_id: real_easte_detail_id,
                parent_comment: null
            },
        })
        const info = await Info_Real_Easte.findOneBy({id: real_easte_detail_id})
        if(info===null)throw Errors.BadRequest
        else{
            console.log(countComment.length);
            if (countComment.length === 0 && user!==null) {
                const comment = new Comment()
                comment.real_easte_id = real_easte_detail_id
                comment.user_id = user.id
                comment.name = user.fullname
                comment.content = content
                //res.totalComment += 1
                //comment.date = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss')
                await comment.save()
                //excuteProcedure(procedure.IncreaseTotalComment, [newsId])
                //const news = await News.findOneBy({ id: newsId })
                // redis_client.HSET(`${`news`}`, `${newsId}`, JSON.stringify(res))
                // redis_client.hSet(
                //     `${email}:${`isSeen`}`,
                //     `${newsId}`,
                //     JSON.stringify(JSON.parse(JSON.stringify(news)))
                // )
                return comment
            } else {
                return { message: 'Chi binh luan duoc 1 lan' }
            }
        }
    }

    editComment = async (commentId: string, content: string, email: string, type: string) => {
        const user = await User.findOneBy({email: email, type: type})
        const comment = await Comment.findOneBy({ id: commentId, user_id:user.id })
        if (comment !== null) {
            comment.content = content
            const date = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss')
            comment.updated_date = date
            comment.save()
            return { comment, message: 'Edit comment successfully' }
        }
        throw Errors.BadRequest
    }

    deleteComment = async (commentId: string, email: string, type: string) => {
        const user = await User.findOneBy({email: email, type: type})
        const comment = await Comment.findOneBy({ id: commentId, parent_comment: null, user_id: user.id })
        if(comment!==null){
            const listReply = await Comment.find({where:{parent_comment: comment.id}})
            const res = await Promise.all(
                listReply.map(async(item)=>{
                    console.log(item);
                    await item.remove()
                })
            )
            await comment.remove()
            return {message:'Xoa thanh cong'}
        }else throw Errors.NotFound
        
    }

    hiddenComment = async (commentId: string, email: string, type: string) => {
        try {
            const user = await User.findOneBy({email: email, type: type})
            const admin = await Admin.findOneBy({email})
            const comment = await Comment.findOneBy({ id: commentId, parent_comment: null })
            if (
                (comment !== null && comment.user_id === user.id) || admin!== null) {
                await Comment.softRemove(comment)
                return { message: 'Hidden comment successfully' }
            } else {
                return { message: 'Hidden comment failure' }
            }
        } catch (error) {
            throw Errors.BadRequest
        }
    }

    replyComment = async (real_easte_id: string,commentId: string,email: string,type:string,content: string) => {
        const comment = await Comment.findOneBy({ id: commentId })
        const user = await User.findOneBy({email: email, type: type})
        if (comment !== null && user!==null) {
            const repComment = new Comment()
            repComment.real_easte_id = real_easte_id
            repComment.user_id = user.id
            repComment.name = user.fullname
            repComment.content = content
            repComment.parent_comment = commentId
            comment.totalRep += 1
            await comment.save()
            await repComment.save()
            return repComment
            }
            throw Errors.NotFound
        }

    

    // getReplyComment = async (replyCommentId: string) => {
    //     const listReplyComment = await Comment.find({
    //         where: { id: replyCommentId },
    //     })
    //     if (listReplyComment.length === 0) throw Errors.NotFound
    //     return listReplyComment
    // }

    editReplyComment = async (replycommentId: string,content: string,email: string, type: string) => {
        const user = await User.findOneBy({email: email, type: type})
        const reply = await Comment.findOneBy({id: replycommentId, user_id: user.id})
        if (reply !== null) {
            reply.content = content
            const date = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss')
            reply.updated_date = date
            reply.save()
            return { reply, message: 'Edit reply comment successfully' }
        }
        throw Errors.BadRequest
    }

    deleteReplyComment = async (replycommentId: string, email: string, type: string) => {
        const user = await User.findOneBy({email: email, type: type})
        const comment = await Comment.findOneBy({ id: replycommentId, user_id: user.id })
        if(comment!==null){
            const news = await Comment.findOneBy({id: comment.parent_comment, parent_comment: null})
            news.totalRep -=1
            await news.save()
            await comment.remove()
            return {message:'Xoa thanh cong'}
        }else throw Errors.NotFound
    }

    hiddenReplyComment = async (replycommentId: string,email: string,type: string) => {
        try {
            const user = await User.findOneBy({email: email, type: type})
            const admin = await Admin.findOneBy({email})
            const comment = await Comment.findOneBy({ id: replycommentId })
            if (
                (comment !== null && comment.user_id === user.id) || admin!== null) {
                await Comment.softRemove(comment)
                return { message: 'Hidden comment successfully' }
            } else {
                return { message: 'Hidden comment failure' }
            }
        } catch (error) {
            throw Errors.BadRequest
        }
    }

    like = async (commentId: string, email: string, type: string) => {
        const queryRunner = dataSource.createQueryRunner()
        await queryRunner.connect()
        const user = await User.findOneBy({email: email, type: type})
        const comment = await Comment.findOneBy({ id: commentId, user_id: user.id })
        await queryRunner.startTransaction()
        try {
            //if(comment.deletedDate !== null)return {message:'Your comment is hidden. Can not like'}
            const checkUserLiked = await Liked.find({
                where: { user_id: user.id, commentId: comment.id },
            })
            if (checkUserLiked.length === 0) {
                comment.like+=1
                await comment.save()
                // queryRunner.query(
                //     `UPDATE comment SET comment.like = comment.like + 1 WHERE id = `,
                //     [commentId]
                // )
                const like = new Liked()
                like.user_id = user.id
                like.commentId = comment.id
                like.save()
                await queryRunner.commitTransaction()
                return { message: 'Like comment successfully' }
            } else {
                await queryRunner.commitTransaction()
                return { message: 'You already like this comment' }
            }
        } catch (error) {
            await queryRunner.rollbackTransaction()
            throw Errors.BadRequest
        } finally {
            await queryRunner.release()
        }
    }

    unlike = async (commentId: string, email: string, type: string) => {
        const queryRunner = dataSource.createQueryRunner()
        await queryRunner.connect()
        const user = await User.findOneBy({email: email, type: type})
        const comment = await Comment.findOneBy({ id: commentId, user_id: user.id })
        await queryRunner.startTransaction()
        try {
            //if(comment.deletedDate !== null)return {message:'Your comment is hidden. Can not like'}
            const checkUserLiked = await Liked.find({
                where: { user_id: user.id, commentId: comment.id },
            })
            console.log(checkUserLiked.length, user.id, comment.id);
            if (checkUserLiked.length !== 0) {
                console.log("object");
                comment.like-=1
                await comment.save()
                // queryRunner.query(
                //     `UPDATE comment SET comment.like = comment.like - 1 WHERE id = `,
                //     [commentId]
                // )
                // queryRunner.query(
                //     'DELETE FROM liked WHERE email=? and commentId =',
                //     [email, commentId]
                // )
                console.log(checkUserLiked);
                checkUserLiked[0].remove()
                await queryRunner.commitTransaction()
                return { message: 'Unlike comment successfully' }
                
            } else {
                throw Errors.NotFound
            }
        } catch (error) {
            await queryRunner.rollbackTransaction()
            return Errors.BadRequest
        } finally {
            await queryRunner.release()
        }
    }

    // likeReply = async (replyCommentId: string, email: string) => {
    //     const queryRunner = dataSource.createQueryRunner()
    //     await queryRunner.connect()
    //     const reply = await Reply.findOneBy({ id: replyCommentId })
    //     await queryRunner.startTransaction()
    //     try {
    //         const checkUserLiked = await Liked.find({
    //             where: { email: email, commentId: replyCommentId },
    //         })
    //         if (checkUserLiked.length === 0) {
    //             queryRunner.query(
    //                 `UPDATE reply SET reply.like = reply.like + 1 WHERE id = ?`,
    //                 [replyCommentId]
    //             )
    //             const like = new Liked()
    //             like.email = email
    //             like.commentId = reply.id
    //             like.save()
    //             await queryRunner.commitTransaction()
    //             return { message: 'Like reply comment successfully' }
    //         } else {
    //             await queryRunner.commitTransaction()
    //             return { message: 'You already like this reply comment' }
    //         }
    //     } catch (error) {
    //         await queryRunner.rollbackTransaction()
    //         throw Errors.BadRequest
    //     } finally {
    //         await queryRunner.release()
    //     }
    // }

    // unlikeReply = async (replycommentId: string, email: string) => {
    //     const queryRunner = dataSource.createQueryRunner()
    //     await queryRunner.connect()
    //     //const reply = await Reply.findOneBy({ id: commentId })
    //     await queryRunner.startTransaction()
    //     try {
    //         const checkUserLiked = await Liked.find({
    //             where: { email: email, commentId: replycommentId },
    //         })
    //         console.log(checkUserLiked.length)
    //         if (checkUserLiked.length !== 0) {
    //             queryRunner.query(
    //                 `UPDATE reply SET reply.like = reply.like - 1 WHERE id = ?`,
    //                 [replycommentId]
    //             )
    //             queryRunner.query(
    //                 'DELETE FROM liked WHERE email=? and commentId=?',
    //                 [email, replycommentId]
    //             )
    //             await queryRunner.commitTransaction()
    //             return { message: 'Unlike reply comment successfully' }
    //         } else {
    //             await queryRunner.commitTransaction()
    //             return { message: 'You not like this reply comment' }
    //         }

    //         //await queryRunner.commitTransaction()
    //         //throw Errors.NotFound
    //     } catch (error) {
    //         await queryRunner.rollbackTransaction()
    //         throw Errors.BadRequest
    //     } finally {
    //         await queryRunner.release()
    //     }
    // }

    listCommentByRealEasteNews = async (
        page: number,
        limit: number,
        column: string,
        real_easte_id: string
    ) => {
        const pagegination = new Pagination(page, limit)
        const offset = pagegination.getOffset()
        const orderExp = `comment.${column}`
        const arr: Array<Object> = []
        //const listNews = await News.find({ take: limit, skip: offset })
        const commentRepository = dataSource.getRepository(Comment)
        const commentList = await commentRepository
            .createQueryBuilder('comment')
            //.addSelect('COUNT(comment.real_easte_id)', "reply_number")
            .where('comment.real_easte_id = :real_easte_id', { real_easte_id })
            .andWhere('comment.parent_comment is null')
            //.select(['id','title','content'])
            //.groupBy('')
            .orderBy(`${orderExp}`, 'DESC')
            .take(limit)
            .offset(offset)
            .getMany()
            console.log(commentList);
        if (commentList.length != 0) {
            commentList.map(async (item) => {
                const user = await User.findOneBy({id: item.user_id})
                user.avatar = await getSignedUrl(
                    s3Client,
                    new GetObjectCommand({
                      Bucket: "lvtn-bds",
                      Key: user.avatar
                    }),
                    { expiresIn: 3600 }// 60*60 seconds
                  )
                const obj = {
                    User: user,
                    Comment: commentList,
                    //ReplyComment: replyList,
                }
                arr.push(obj)
            })
            
            return arr
        }else
        throw Errors.NotFound
    }

    listReplyByComment = async (
        page: number,
        limit: number,
        commentId: string
    ) => {
        const pagegination = new Pagination(page, limit)
        const offset = pagegination.getOffset()
        const commentRepository = dataSource.getRepository(Comment)
        const arr: Array<Object> = []
        const commentList = await commentRepository
            .createQueryBuilder('comment')
            .where('comment.parent_comment = :commentId', { commentId })
            .take(limit)
            .offset(offset)
            .getManyAndCount()

        if (commentList[1] !== 0){
            commentList[0].map(async (item) => {
                const user = await User.findOneBy({id: item.user_id})
                user.avatar = await getSignedUrl(
                    s3Client,
                    new GetObjectCommand({
                      Bucket: "lvtn-bds",
                      Key: user.avatar
                    }),
                    { expiresIn: 3600 }// 60*60 seconds
                  )
                const obj = {
                    User: user,
                    Comment: commentList,
                    //ReplyComment: replyList,
                }
                arr.push(obj)
            })
            
            return arr
        } //return commentList[0]
        throw Errors.NotFound
    }

    // listCommentByUser = async (email: string, page:number, limit:number, type: string) => {
    //     const pagegination = new Pagination(page, limit)
    //     const users = await User.findOneBy({email: email, type: type})
    //     const offset = pagegination.getOffset()
    //     const userList = await User.find({
    //         where: { email: email },
    //         take: limit,
    //         skip: offset,
    //     })
    //     const arr: Array<Object> = []
    //     const data = await Promise.all(
    //         userList.map(async (user) => {
    //             const commentList = await Comment.find({
    //                 where: { user_id: users.id },
    //                 take: limit,
    //                 skip: offset,
    //             })
    //             const replyList = await Reply.find({
    //                 where: { email: user.email },
    //                 take: limit,
    //                 skip: offset,
    //             })
    //             const obj = {
    //                 // User: user,
    //                 Comment: commentList,
    //                 ReplyComment: replyList,
    //             }
    //             arr.push(obj)
    //         })
    //     )
    //     return arr
    // }
}