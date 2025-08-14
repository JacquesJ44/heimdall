from flask import Flask
from flask_mail import Mail, Message
from db import DbUtil  # Your existing DB handler
from dotenv import load_dotenv
import os

import pprint

# Load variables from .env
load_dotenv()

# Set up a minimal Flask app context for Flask-Mail to work
app = Flask(__name__)

# Email Config
app.config['MAIL_SERVER'] = os.getenv('MAIL_SERVER')
app.config['MAIL_PORT'] = int(os.getenv('MAIL_PORT'))
app.config['MAIL_USE_TLS'] = os.getenv('MAIL_USE_TLS', 'True').lower() == 'true'
app.config['MAIL_USERNAME'] = os.getenv('MAIL_USERNAME')
app.config['MAIL_PASSWORD'] = os.getenv('MAIL_PASSWORD')
app.config['MAIL_DEFAULT_SENDER'] = os.getenv('MAIL_USERNAME')

recipient_email = os.getenv('RECIPIENT_EMAIL')


mail = Mail(app)


def get_email_addresses():
    
    return '-'

def main():
    db = DbUtil({
        'host': os.getenv('DB_HOST'),
        'user': os.getenv('DB_USER'),
        'password': os.getenv('DB_PASSWORD'),
        'db': os.getenv('DB_NAME')
    })

    # 1 = 4 on O
    # 2 = 6 on N
    # 3 = 126 on M
    # 4 = 82 on M
    # 5 = 343 on B
    # 6 = Spice Yard

    site_id = 2
    
    email_list = db.get_mail(site_id)
    if email_list:
        emails = email_list[0][0]
        pprint.pprint(email_list)
        return emails
    else:
        print("No emails found")
        return None
    
    # with app.app_context():
    #     body = format_circuit_email(expiring, expired)
    #     msg = Message(
    #         subject="Mimir: Circuits Expiring Soon",
    #         recipients=[recipient_email],
    #         body=body
    #     )
    #     mail.send(msg)
    #     print(f"Sent notification to {recipient_email}.")


if __name__ == "__main__":
    main()