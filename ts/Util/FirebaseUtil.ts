
module Util {
    export class FirebaseUtil {
        private static secrect : string = "eoyakpIFmf4LTm6JcUPElixc8ieeQujvDF7bCGNh";
        private static baseUrl : string = "https://boiling-heat-2521.firebaseio.com/";

        public static getFirebase(url : string) : Promise<Firebase> {
            return new Promise((resolve : Function) => {
                var firebase : Firebase = new Firebase(FirebaseUtil.baseUrl + url);
                firebase.authWithCustomToken(FirebaseUtil.secrect, () => {
                    resolve(firebase);
                })
            })
        }
    }
}