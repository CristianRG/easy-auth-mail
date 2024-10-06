export const types = {
    'text/plain': 'text',
    'text/html': 'html',
}

class MailOptions {
    constructor(from, to, subject) {
        this.from = from;
        this.to = to;
        this.subject = subject;
        this.text = null;
        this.html = null;
    }

    setContent(type, content){
        switch (type) {
            case 'text':
                this.text = content
                break;
            case 'html':
                this.html = content
            default:
                this.text = content
                break;
        }
    }

    getObject(){
        if(this.html!=null){
            return {
                from: this.from,
                to: this.to,
                subject: this.subject,
                html: this.html
            }
        }
        else {
            return {
                from: this.from,
                to: this.to,
                subject: this.subject,
                text: this.text
            }
        }
    }
}

export default MailOptions