import { Expose, plainToInstance } from 'class-transformer'
import { Response } from 'express'
import { logger } from './logger'
import { ResponseWrapper } from './response.wrapper'

export class ErrorResp extends Error {
    @Expose()
    readonly status: number

    @Expose()
    readonly code: string

    @Expose()
    readonly message: string

    constructor(code: string, message: string, status?: number) {
        super()
        this.status = status
        this.code = code
        this.message = message
        this.stack = undefined
    }
}

export const Errors = {
    BadRequest: new ErrorResp('error.badRequest', 'Bad request', 400),
    Unauthorized: new ErrorResp('error.unauthorized', 'Unauthorized', 401),
    Forbidden: new ErrorResp('error.forbiden', 'Forbidden', 403),
    Sensitive: new ErrorResp(
        'error.sensitive',
        'An error occurred, please try again later.',
        400
    ),
    InternalServerError: new ErrorResp(
        'error.internalServerError',
        'Internal server error.',
        500
    ),
    NotFound: new ErrorResp('error.notFound', 'Not Founded', 404),
    WrongUsernameOrPassword: new ErrorResp('error.usernameOrPassWrong', 'Wrong Username Or Password', 404),
    VerifyCodeIsWrong: new ErrorResp('error.verifyCodeIsWrong','Verify Code Is Wrong', 400),
    InvalidRefreshToken: new ErrorResp('error.invalidRefreshToken','Invalid refresh token', 400),
    InvalidRequest: new ErrorResp('error.invalidRequest','Invalid request', 400),
}

export const handleError = (err: Error, res: Response) => {
    if (err instanceof ErrorResp) {
        const errResp = err as ErrorResp
        res.status(errResp.status || Errors.BadRequest.status).send(
            new ResponseWrapper(
                null,
                plainToInstance(ErrorResp, errResp, {
                    excludeExtraneousValues: true,
                })
            )
        )
    } else {
        // if (isProduction) {
        //     res.status(Errors.Sensitive.status).send(
        //         new ResponseWrapper(null, Errors.Sensitive)
        //     )
        //     return
        // }
        logger.error(JSON.stringify(err))
        const errResp = new ErrorResp(
            Errors.InternalServerError.code,
            JSON.stringify(err),
            Errors.InternalServerError.status
        )
        res.status(Errors.Sensitive.status).send(
            new ResponseWrapper(null, errResp)
        )
    }
}
