export class User{
    #uid;
    #first_name;
    #last_name;
    #name;
    #email;
    #profile_pic;

    constructor(uid, first_name, last_name, email, profile_pic){
        this.#uid = uid;
        this.#first_name = first_name;
        this.#last_name = last_name;
        this.#name = `${first_name} ${last_name}`;
        this.#email = email;
        this.#profile_pic = profile_pic;
    }

    set uid(uid){ this.#uid = uid; }
    get uid(){ return this.#uid; }
    set first_name(first_name){ this.#first_name = first_name; }
    get first_name(){ return this.#first_name; }
    set last_name(last_name){ this.#last_name = last_name; }
    get last_name(){ return this.#last_name; }
    set name(name){ this.#name = name; }
    get name(){ return this.#name; }
    set email(email){ this.#email = email; }
    get email(){ return this.#email; }
    set profile_pic(profile_pic){ this.#profile_pic = profile_pic; }
    get profile_pic(){ return this.#profile_pic; }

    getFullName(){
        return this.#first_name + ' ' + this.#last_name;
    }
}