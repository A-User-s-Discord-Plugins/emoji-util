import path from "path"
import url from 'url'
import * as http from "@vizality/http"

export default {
    linkToBase64: async(link) => {
        let ext = path.extname(url.parse(link).pathname).substring(1);
        let {raw} = await http.get(link)
        return `data:image/${ext};base64,${raw.toString('base64')}`;
    }
}