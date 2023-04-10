export class Conversation{
    #conversationID;
    #name;
    #last_message;
    #profile_pic;

    constructor(conversationID, name, last_message, profile_pic){
        this.#conversationID = conversationID;
        this.#name = name;
        this.#last_message = last_message;
        this.#profile_pic = profile_pic;
    }

    set conversationID(conversationID){ this.#conversationID = conversationID; }
    set name(name){ this.#name = name; }
    set last_message(last_message){ this.#last_message = last_message; }
    set profile_pic(profile_pic){ this.#profile_pic = profile_pic; }

    get conversationID(){ return this.#conversationID; }
    get name(){ return this.#name; }
    get last_message(){ return this.#last_message; }
    get profile_pic(){ return this.#profile_pic; }
}