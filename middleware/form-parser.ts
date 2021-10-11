import formidable from "formidable";
import { NextApiRequest, NextApiResponse } from "next";

const form = formidable()

// From https://chadalen.com/blog/how-to-use-a-multipart-form-in-nextjs-using-api-routes
export default async function parseForm(req: NextApiRequest, _res: NextApiResponse, next: Function) {
    const contentType = req.headers['content-type']
    if(contentType && contentType.includes("multipart/form-data")) {
        form.parse(req, (err, fields, _files) => {
            console.log('Parsed form!', err, fields)
            if(!err) {
                req.body = fields
            } else {
                throw err
            }
            next()
        })
    } else {
        next()
    }
}
