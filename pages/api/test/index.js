import fs from 'fs'
import path from 'path'

export default async (req, res) => {

    const dirRelativeToPublicFolder = 'images'
    const dir = path.resolve('./public', dirRelativeToPublicFolder);

    return res.status(200).json({msg:"OK", dir})

}