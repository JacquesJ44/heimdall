from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from flask_jwt_extended import create_access_token,get_jwt,get_jwt_identity, unset_jwt_cookies, jwt_required, JWTManager
from flask_mail import Mail, Message
from datetime import datetime, timedelta, timezone
from decimal import Decimal, InvalidOperation
from datetime import datetime, date
from collections import defaultdict
from calendar import monthrange
from itsdangerous import URLSafeTimedSerializer
from threading import Thread
from dotenv import load_dotenv
import hashlib
import binascii
import json
import os

from pprint import pprint
from urllib.parse import unquote

# Load variables from .env
load_dotenv()

from db import DbUtil
db = DbUtil({
    'host': os.getenv('DB_HOST'),
    'user': os.getenv('DB_USER'),
    # 'password': os.getenv('DB_PASSWORD'),
    'db': os.getenv('DB_NAME')
})

app = Flask(__name__, static_url_path="/heimdall/static") # Path to your React build folder

# Secret Keys
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=1)

# Email
app.config['MAIL_SERVER'] = os.getenv('MAIL_SERVER')
app.config['MAIL_PORT'] = int(os.getenv('MAIL_PORT'))
app.config['MAIL_USE_TLS'] = os.getenv('MAIL_USE_TLS') == 'True'
app.config['MAIL_USERNAME'] = os.getenv('MAIL_USERNAME')
app.config['MAIL_PASSWORD'] = os.getenv('MAIL_PASSWORD')
app.config['MAIL_DEFAULT_SENDER'] = os.getenv('MAIL_USERNAME')

serializer = URLSafeTimedSerializer(app.config['SECRET_KEY'])

jwt = JWTManager(app)
mail = Mail(app)

con = db.get_connection()

cur = con.cursor()
cur.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INT(5) PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(50),
        surname VARCHAR(50),
        email VARCHAR(50) UNIQUE,
        password VARCHAR(200)
    )
 """)

cur.execute("""
    CREATE TABLE IF NOT EXISTS sites (
        id INT(5) PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(50) UNIQUE,
        street VARCHAR(50),
        suburb VARCHAR(50)
    )
 """)

cur.execute("""
    CREATE TABLE IF NOT EXISTS products (
        id INT(5) PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(50) UNIQUE,
        selling_price DECIMAL(5,2),
        cost_price DECIMAL(5,2)
    )
""")

cur.execute("""
    CREATE TABLE IF NOT EXISTS services (
        id INT(5) PRIMARY KEY AUTO_INCREMENT,
        site_id INT(5),
        unit_number VARCHAR(25),
        onu_make VARCHAR(50),
        onu_model VARCHAR(50),
        onu_serial VARCHAR(50),
        onu_number VARCHAR(20),
        gpon_serial VARCHAR(50),
        status BOOLEAN,
        light_level VARCHAR(10),
        pppoe_un VARCHAR(20),
        pppoe_pw VARCHAR(20),
        ssid_24ghz VARCHAR(50),
        password_24ghz VARCHAR(50),
        ssid_5ghz VARCHAR(50),
        password_5ghz VARCHAR(50),
        customer_fullname VARCHAR(100),
        contact_number VARCHAR(50),
        email VARCHAR(100),
        debit_order_status VARCHAR(50),
        fluent_living BOOLEAN,
        product_id INT(5),
        activation_date DATE,
        comments VARCHAR(255),
        FOREIGN KEY (product_id) REFERENCES products(id),
        FOREIGN KEY (site_id) REFERENCES sites(id)
    )
""")           
         
con.close()

# Hash the password
def hash_password(password):
    salt = hashlib.sha256(os.urandom(60)).hexdigest().encode('ascii')
    pwdhash = hashlib.pbkdf2_hmac('sha512', password.encode('utf-8'), salt, 100000)
    pwdhash = binascii.hexlify(pwdhash)
    return (salt + pwdhash).decode('ascii')

def verify_password(stored_password, provided_password):
    # Extract the salt from the stored password (first 64 characters = 32 bytes = 64 hex chars)
    salt = stored_password[:64].encode('ascii')
    
    # Extract the actual hash from the stored password
    stored_pwdhash = stored_password[64:]
    
    # Recompute the hash using the provided password and the same salt
    pwdhash = hashlib.pbkdf2_hmac('sha512', provided_password.encode('utf-8'), salt, 100000)
    pwdhash = binascii.hexlify(pwdhash).decode('ascii')
    
    # Compare the hashes
    return pwdhash == stored_pwdhash

# Function to refresh JWT
@app.after_request
def refresh_expiring_jwts(response):
    try:
        exp_timestamp = get_jwt()["exp"]
        now = datetime.now(timezone.utc)
        target_timestamp = datetime.timestamp(now + timedelta(minutes=2))
        if target_timestamp > exp_timestamp:
            access_token = create_access_token(identity=get_jwt_identity())
            data = response.get_json()
            if type(data) is dict:
                data["access_token"] = access_token 
                response.data = json.dumps(data)
        return response
    except (RuntimeError, KeyError):
        # Case where there is not a valid JWT. Just return the original respone
        return response

#Login route 
@app.route('/api/login', methods=['POST'])
def login():

    if not request.is_json:
        return jsonify({"msg": "Invalid request: JSON required"}), 400
    
    data = request.get_json()
    # print(data)
    
    row = db.get_user_by_email(data['email'])
    if not row:
       return jsonify({"msg": "User with this email does not exist"}), 400

    if not verify_password(row[4], data['password']):
        return jsonify({"msg": "Invalid credentials"}), 401

    access_token = create_access_token(identity=data['email'])
    return jsonify(access_token=access_token)

@app.route("/api/register", methods=["POST"])
def register():
    data = request.get_json()
    # print(data)

    row = db.get_user_by_email(data['email'])
    if row is not None:
        return jsonify({"msg": "User with this email already exists"}), 400

    if data['password'] != data['confirmPassword']:
        return jsonify({"msg": "Passwords do not match"}), 400
    
    secured_password = hash_password(data['password'])
    db.save_user(data['name'], data['surname'], data['email'], secured_password)

    return jsonify({"msg": "Registration successful"})

# See all sites
@app.route("/api/sites", methods=["GET"])
@jwt_required()
def sites():
    x = db.get_all_sites()
    # print(x)
    return jsonify(x)
    
# Add a site
@app.route("/api/sites/addsite", methods=["POST"])
@jwt_required()
def add_site():
    data = request.get_json()
    # print(data)
    row = db.get_site_by_name(data['name'])
    # print(row)

    if row:
        return jsonify({"msg": "Site already exists!"}), 400
    else:
        db.save_site(data['name'], data['street'], data['suburb'])
        return jsonify({'message': 'Site added successfully'}), 200

# Delete a site
@app.route("/api/sites/deletesite", methods=["DELETE"])
@jwt_required()
def delete_site():
    data = request.get_json()
    # print(data)
    site_id = data.get('id')
    if not site_id:
        return jsonify({'error': 'Missing site ID'}), 400

    success = db.delete_site(site_id)
    
    if success:
        return jsonify({'message': 'Site deleted successfully'}), 200
    else:
        return jsonify({'error': 'Site not found or failed to delete'}), 404

# Edit a site 
@app.route("/api/sites/editsite/<int:site_id>", methods=["GET", "PUT"]) 
@jwt_required()
def edit_site(site_id):
    if request.method == "GET":
        data = db.get_site_by_id(site_id)
        # print(data)
        if data:
            return jsonify(data)
        return jsonify({'error': 'Site not found'}), 404

    if request.method == "PUT":
        data = request.get_json()
        # print(data)
        success = db.edit_site(site_id, data['name'], data['street'], data['suburb'])
        if success > 0: 
            return jsonify({'message': 'Site edited successfully'}), 200
        else:
            return jsonify({'error': 'No changes made'}), 404
    
# See all products
@app.route("/api/products", methods=["GET"])
@jwt_required()
def products():
    x = db.get_all_products()
    # print(x)
    return jsonify(x)

# Add a product
@app.route("/api/products/addproduct", methods=["POST"])
@jwt_required()
def add_product():
    data = request.get_json()
    
    # Check if product already exists
    row = db.get_product_by_name(data['name'])
    if row:
        return jsonify({"msg": "Product already exists!"}), 400

    # Validate cost_price and selling_price
    try:
        cost_price = Decimal(data['cost_price'])
        selling_price = Decimal(data['selling_price'])
    except (InvalidOperation, KeyError, TypeError, ValueError):
        return jsonify({"msg": "Invalid cost or selling price. Must be valid decimal numbers."}), 400

    # Save the product
    db.save_product(data['name'], cost_price, selling_price)
    return jsonify({'message': 'Product added successfully'}), 200

# Delete a product
@app.route("/api/products/deleteproduct", methods=["DELETE"])
@jwt_required()
def delete_product():
    data = request.get_json()
    # print(data)
    product_id = data.get('id')
    if not product_id:
        return jsonify({'error': 'Missing site ID'}), 400

    success = db.delete_product(product_id)
    
    if success:
        return jsonify({'message': 'Site deleted successfully'}), 200
    else:
        return jsonify({'error': 'Site not found or failed to delete'}), 404
    
# Edit a product
@app.route("/api/products/editproduct/<int:product_id>", methods=["GET", "PUT"])
@jwt_required()
def edit_product(product_id):
    if request.method == "GET":
        data = db.get_product_by_id(product_id)
        # print(data)
        if data:
            return jsonify(data)
        return jsonify({'error': 'Site not found'}), 404

    if request.method == "PUT":
        data = request.get_json()
        # print(data)

    # Validate cost_price and selling_price
    try:
        cost_price = Decimal(data['cost_price'])
        selling_price = Decimal(data['selling_price'])
    except (InvalidOperation, KeyError, TypeError, ValueError):
        return jsonify({"msg": "Invalid cost or selling price. Must be valid decimal numbers."}), 400
    
    try:
        success = db.edit_product(product_id, data['name'], selling_price, cost_price)
        if success > 0: 
            return jsonify({'message': 'Product edited successfully'}), 200
        else:
            return jsonify({'error': 'No changes made'}), 404
    except Exception as e:
        print("DB error:", e)
        return jsonify({'msg': 'An Error Ocurred while updating product'}), 404
    
# See all services
@app.route("/api/services", methods=["GET"])
@jwt_required()
def services():
    x = db.get_all_services()
    # print(x)
    return jsonify(x)

# Add a service
@app.route("/api/services/addservice", methods=["POST"])
@jwt_required()
def add_service():
    data = request.get_json()

    if not data:
        return jsonify({"msg": "Missing JSON in request"}), 400

    required_fields = [
        'site_id', 'unit_number', 'onu_make', 'onu_model', 'onu_serial',
        'onu_number', 'gpon_serial', 'status', 'light_level', 'pppoe_un',
        'pppoe_pw', 'ssid_24ghz', 'password_24ghz', 'ssid_5ghz', 'password_5ghz',
        'customer_fullname', 'contact_number', 'email', 'debit_order_status',
        'fluent_living', 'product_id', 'activation_date', 'comments'
    ]

    # Check for missing fields
    missing = [field for field in required_fields if field not in data]
    if missing:
        return jsonify({"msg": f"Missing fields: {', '.join(missing)}"}), 400

    # Check if service already exists
    try:
        existing_service = db.verify_service(data['site_id'], data['unit_number'])
    except Exception as e:
        print(f"DB error during verification: {e}")
        return jsonify({"msg": "Database error while verifying service."}), 500

    if existing_service:
        return jsonify({"msg": "Service already exists in this unit!"}), 400
    
    activation_date_str = data.get('activation_date')
    if activation_date_str:
        activation_date = datetime.strptime(activation_date_str, '%Y-%m-%d').date()
    else:
        activation_date = None

    # Save the service
    try:
        db.save_service(
            data['site_id'], data['unit_number'], data['onu_make'], data['onu_model'], data['onu_serial'],
            data['onu_number'], data['gpon_serial'], data['status'], data['light_level'],
            data['pppoe_un'], data['pppoe_pw'], data['ssid_24ghz'], data['password_24ghz'],
            data['ssid_5ghz'], data['password_5ghz'], data['customer_fullname'],
            data['contact_number'], data['email'], data['debit_order_status'],
            data['fluent_living'], data['product_id'], activation_date, data['comments']
        )
    except Exception as e:
        print(f"DB error during save: {e}")
        return jsonify({"msg": "Failed to save the service due to a server error."}), 500

    return jsonify({'message': 'Service added successfully'}), 200

# Edit a service 
@app.route("/api/services/editservice/<int:service_id>", methods=["GET", "PUT"])
@jwt_required()
def edit_service(service_id):
    if request.method == "GET":
        data = db.get_service_by_id(service_id)

        # Strip the date from the backend into just the date
        if data['activation_date']:
            data['activation_date'] = data['activation_date'].strftime('%Y-%m-%d')
        
        if data:
            return jsonify(data)
        return jsonify({'error': 'Site not found'}), 404

    if request.method == "PUT":
        data = request.get_json()
        # print(data)
        success = db.edit_service(service_id, **data)
        if success > 0: 
            return jsonify({'message': 'Site edited successfully'}), 200
        else:
            return jsonify({'error': 'No changes made'}), 404

# Delete a service
@app.route("/api/services/deleteservice", methods=["DELETE"])
@jwt_required()
def delete_service():
    data = request.get_json()
    # print(data)
    service_id = data.get('id')
    if not service_id:
        return jsonify({'error': 'Missing service ID'}), 400

    success = db.delete_service(service_id)
    
    if success:
        return jsonify({'message': 'Site deleted successfully'}), 200
    else:
        return jsonify({'error': 'Site not found or failed to delete'}), 404

# Dashboard Route - for displaying pie chart data
@app.route("/api/dashboard", methods=["GET"])
@jwt_required()
def dashboard():
    x = db.pie_chart_data()

    chart_data = {}

    for row in x:
        site = row['site_name']
        if site not in chart_data:
            chart_data[site] = []
        chart_data[site].append({
            "package": row["package_name"],
            "value": row["value"]
        })
    # print("CHART DATA:")
    # pprint(chart_data)
    return jsonify(chart_data)

# Drill into a site from the dashboard
@app.route("/api/dashboard/site/<string:site>", methods=["GET"])
@jwt_required()
def dashboard_site(site):
    site = unquote(site) # Decode the site name

    x = db.services_per_site(site)
    # print("DATA:")
    # pprint(x)

    total = len(x)
    active_units = [u for u in x if u['status'] == 1]
    total_active = len(active_units)
    total_selling = sum(u['selling_price'] for u in active_units if u['selling_price'] is not None)

    return jsonify({
        "total": total,
        "active": total_active,
        "total_selling": total_selling,
        "units": x
    })

# Route for calculating of active services in the current month
@app.route("/api/dashboard/site/<string:site>/po", methods=["GET"])
@jwt_required()
def calculate_po(site):
    site = unquote(site)
    services = db.services_per_site(site)

    now = datetime.now()
    current_year = now.year
    current_month = now.month

    # Group by package
    package_summary = defaultdict(lambda: {"count": 0, "cost_price": 0})

    for s in services:
        if s["status"] == 1 and s["package"]:  # only active services with valid packages
            activation_date = s.get("activation_date")
            # print(f"{activation_date=}, {activation_date.year=}, {activation_date.month=}")

            # Skip if activation_date is None or not a datetime
            if not activation_date or not isinstance(activation_date, (datetime, date)):
                continue

            # Skip if the activation date is in the current month
            if activation_date.year == current_year and activation_date.month == current_month:
                continue
            

            key = s["package"]
            package_summary[key]["count"] += 1
            package_summary[key]["cost_price"] = s["cost_price"]  # assumed to be consistent

    # Build response list
    result = []
    for package, data in package_summary.items():
        count = data["count"]
        cost_price = data["cost_price"]
        total = round(count * cost_price, 2)
        result.append({
            "package": package,
            "count": count,
            "cost_price": cost_price,
            "total": total
        })

    # pprint(result)
    return jsonify(result)

# Calulate prorata rates for the services in the previous month
@app.route("/api/dashboard/site/<string:site>/prorata", methods=["GET"])
@jwt_required()
def calculate_prorata(site):
    site = unquote(site)
    services = db.services_per_site(site)

    now = datetime.now()
    current_year = now.year
    current_month = now.month

    # Get previous month and year
    if current_month == 1:
        prev_month = 12
        prev_year = current_year - 1
    else:
        prev_month = current_month - 1
        prev_year = current_year

    # Total days in previous month
    days_in_prev_month = monthrange(prev_year, prev_month)[1]
    start_of_prev_month = datetime(prev_year, prev_month, 1)
    end_of_prev_month = datetime(prev_year, prev_month, days_in_prev_month)

    prorata_services = []

    for s in services:
        activation_date = s.get("activation_date")
        cost_price = s.get("cost_price")
        package = s.get("package")

        if s["status"] != 1 or not activation_date or not package:
            continue

        # Parse date safely
        if isinstance(activation_date, datetime):
            activation_dt = activation_date
        else:
            try:
                activation_dt = datetime.strptime(str(activation_date), "%Y-%m-%d")
            except Exception:
                continue

        # ✅ Only include services activated in the previous month
        if activation_dt.year != prev_year or activation_dt.month != prev_month:
            continue

        active_days = (end_of_prev_month - activation_dt).days + 1
        prorata = round((active_days / days_in_prev_month) * float(cost_price), 2)

        prorata_services.append({
            "unit": s["unit_number"],
            "package": package,
            "activation_date": activation_dt.strftime("%d %b %Y"),
            "cost_price": cost_price,
            "active_days": active_days,
            "prorata_amount": prorata,
        })

    # pprint(prorata_services)
    return jsonify(prorata_services)

@app.route("/api/dashboard/site/<string:site>/fluent_living", methods=["GET"])
@jwt_required()
def fluent_living(site):
    site = unquote(site)
    services = db.get_fluent_living(site)

    #pprint(services)
    return jsonify(services)


# Route for the navbar
@app.route("/api/navbar")
@jwt_required()
def navbar():
    current_user = get_jwt_identity()
    # print('current_user: ', current_user)
    return jsonify(logged_in_as=current_user)

# Route for forgotten password
@app.route('/api/forgot-password', methods=['POST'])
def forgot_password():
    data = request.get_json()
    email = data.get('email')

    user = db.get_user_by_email(email)

    if user:
        token = serializer.dumps(email, salt='password-reset')
        # reset_url = url_for('reset_password', token=token, _external=True)
        reset_url = f"http://localhost:3000/reset-password/{token}"

        # Launch email sending in a background thread
        Thread(target=send_reset_email, args=(app, email, reset_url)).start()

    return jsonify({'message': 'If the email exists, a reset link will be sent.'}), 200

# Create a thread so the mail sending logic runs in the background while the alert message is displayed
def send_reset_email(app, email, reset_url):
    with app.app_context():
        
    # Send email (for now, just print it)
    # print(f"Send this reset link to the user: {reset_url}")

        msg = Message("Password Reset Request", recipients=[email])
        msg.body = f"Click the link to reset your password: {reset_url}"
        msg.html = f"""\
                        <p>Hello,</p>
                        <p>Click below to reset your password:</p>
                        <a href="{reset_url}">{reset_url}</a>
                    """
        try:
            mail.send(msg)
            print("Email sent!")
        except Exception as e:
            print("Failed to send email:", e)

# Route for password reset
@app.route('/api/reset-password/<token>', methods=['POST'])
def reset_password(token):
    data = request.get_json()
    new_password = data.get('new_password')  # Make sure to hash this in production

    new_password_hashed = hash_password(new_password)

    try:
        email = serializer.loads(token, salt='password-reset', max_age=3600)  # 1-hour expiry
    except Exception:
        return jsonify({'message': 'Invalid or expired token'}), 400

    db.update_forgotten_pw(email, new_password_hashed)

    return jsonify({'message': 'Password reset successfully'}), 200

#Logout route
@app.route("/api/logout", methods=["POST"])
def logout():
    response = jsonify({"msg": "logout successful"})
    unset_jwt_cookies(response)
    return response

# This route will serve the React app - this helps for routing in the Production environment
@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve(path):
    # Exclude API routes from being caught here
    if path.startswith("api") or path.startswith("static") or path.endswith(('.js', '.css', '.json', '.ico', '.png')):
        return send_from_directory(app.static_folder, path)

    # Serve actual files if they exist
    full_path = os.path.join(app.static_folder, path)
    if os.path.exists(full_path):
        return send_from_directory(app.static_folder, path)

    # Serve React index.html for everything else
    return send_from_directory(app.static_folder, "index.html")

if __name__ == '__main__':
    CORS(app, supports_credentials=True, resource={r"/*": {"origins": "*"}})
    app.run()
