from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import create_access_token,get_jwt,get_jwt_identity, unset_jwt_cookies, jwt_required, JWTManager
from datetime import datetime, timedelta, timezone
from decimal import Decimal, InvalidOperation
from datetime import datetime
import hashlib
import binascii
import pymysql
import json
import os

from db import DbUtil
db = DbUtil({
    'host': 'localhost',
    'user': 'root',
    'db': 'heimdall'
})

app = Flask(__name__)

app.config['SECRET_KEY'] = os.urandom(12).hex()
app.config['JWT_SECRET_KEY'] = 'idjfehoHkhK#54kk5k2$kjhfe'
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=1)
jwt = JWTManager(app)

con = pymysql.connect(host='localhost', user='root', database='heimdall')
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
@app.route('/login', methods=['GET','POST'])
def login():
    data = request.get_json()
    # print(data)
    
    row = db.get_user_by_email(data['email'])
    if not row:
       return jsonify({"msg": "User with this email does not exist"}), 400

    if not verify_password(row[4], data['password']):
        return jsonify({"msg": "Invalid credentials"}), 401

    access_token = create_access_token(identity=data['email'])
    return jsonify(access_token=access_token)

@app.route("/register", methods=["POST"])
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
@app.route("/sites", methods=["GET"])
def sites():
    x = db.get_all_sites()
    # print(x)
    return jsonify(x)
    
# Add a site
@app.route("/sites/addsite", methods=["POST"])
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
@app.route("/sites/deletesite", methods=["DELETE"])
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
@app.route("/sites/editsite/<int:site_id>", methods=["GET", "PUT"])    
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
@app.route("/products", methods=["GET"])
def products():
    x = db.get_all_products()
    # print(x)
    return jsonify(x)

# Add a product
@app.route("/products/addproduct", methods=["POST"])
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
@app.route("/products/deleteproduct", methods=["DELETE"])
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
@app.route("/products/editproduct/<int:product_id>", methods=["GET", "PUT"])    
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
@app.route("/services", methods=["GET"])
def services():
    x = db.get_all_services()
    # print(x)
    return jsonify(x)

# Add a service
@app.route("/services/addservice", methods=["POST"])
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
@app.route("/services/editservice/<int:service_id>", methods=["GET", "PUT"])    
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
@app.route("/services/deleteservice", methods=["DELETE"])
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
    


#Logout route
@app.route("/logout", methods=["POST"])
def logout():
    response = jsonify({"msg": "logout successful"})
    unset_jwt_cookies(response)
    return response


# Dashboard Route - for displaying pie chart data
@app.route("/dashboard", methods=["GET"])
def dashboard():
    x = db.pie_chart_data()
    # print(x)

    chart_data = {}

    for row in x:
        site = row['site_name']
        if site not in chart_data:
            chart_data[site] = []
        chart_data[site].append({
            "package": row["package_name"],
            "value": row["value"]
        })

    # print(chart_data)
    return jsonify(chart_data)

@app.route("/navbar")
@jwt_required()
def navbar():
    current_user = get_jwt_identity()
    # print('current_user: ', current_user)
    return jsonify(logged_in_as=current_user)

if __name__ == '__main__':
    CORS(app, supports_credentials=True, resource={r"/*": {"origins": "*"}})
    app.run(debug=True)