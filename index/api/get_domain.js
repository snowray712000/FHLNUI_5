import { isRDLocation } from "../isRDLocation.es2023.js";

export function get_domain(){
    return isRDLocation() ? "http://127.0.0.1:15600" : ""
}
