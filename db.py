import pymysql
from datetime import datetime
from flask import request

import pprint 

class DbUtil:
    def __init__(self, config):
        self.config = config 

    def get_connection(self):
        return pymysql.connect(
            host=self.config['host'],
            user=self.config['user'],
            # password=self.config.get('password'),
            db=self.config['db'],
            cursorclass=pymysql.cursors.Cursor  # or DictCursor if you prefer
        )

    # DB OPS WITH USERS
    # Save a new user
    def save_user(self, name, surname, email, password):
        con = self.get_connection()

        try:
            with con.cursor() as c:
                c.execute(
                    'INSERT INTO users (name, surname, email, password) VALUES (%s, %s, %s, %s)', (name, surname, email, password)
                ) 
                con.commit()
                return c.lastrowid
        finally:
            con.close()
    
    # Search for a user in the users table
    def get_user_by_email(self, email):
        con = self.get_connection()
        try:
            with con.cursor() as c:
                c.execute('SELECT * FROM users WHERE email = %s', (email,))
                row = c.fetchone()
                if row is None:
                    return None
                col_names = [desc[0] for desc in c.description]
                return dict(zip(col_names, row))
        finally:
            con.close()


    def update_forgotten_pw(self, email, password):
        con = self.get_connection()

        try:
            with con.cursor() as c:
                c.execute(
                    'UPDATE users SET password = %s WHERE email = %s', (password, email)
                )
                con.commit()
        finally:
            con.close()

    # Get all email addresses associated with a particular building
    def get_mail(self, site_id):
        con = self.get_connection()

        try:
            with con.cursor() as c:
                c.execute("""
                    SELECT 
                        GROUP_CONCAT(DISTINCT email SEPARATOR ', ') AS emails
                    FROM 
                        services
                    JOIN 
                        sites s ON services.site_id = s.id
                    WHERE 
                        s.id = %s
                        AND email IS NOT NULL 
                        AND email != '';
                """, (site_id,))
                
                result = c.fetchall()
                return result[0] if result and result[0] else None
        finally:
            con.close()

    # Get all users
    def get_all_users(self):
        con = self.get_connection()

        try:
            with con.cursor() as c:
                c.execute(
                    'SELECT * FROM users;'
                )
                rows = c.fetchall()
                col_names = [c[0] for c in c.description]
                return [dict(zip(col_names, row)) for row in rows]
        finally:
            con.close()

    def get_summary_for_user(self, user_id=None):
        con = self.get_connection()
        try:
            with con.cursor() as c:
                if user_id:
                    # Filter by client_site_access for normal users
                    c.execute("""
                        SELECT 
                            s.id AS site_id,
                            s.name AS site_name,
                            s.running_cost,
                            COALESCE(SUM(p.cost_price), 0) AS total_revenue,
                            COALESCE(SUM(p.cost_price), 0) - s.running_cost AS net_profit
                        FROM client_site_access csa
                        INNER JOIN sites s ON csa.site_id = s.id
                        LEFT JOIN services sv ON s.id = sv.site_id
                        LEFT JOIN products p ON sv.product_id = p.id
                        WHERE csa.user_id = %s
                        GROUP BY s.id, s.name, s.running_cost
                        ORDER BY s.name ASC
                    """, (user_id,))
                else:
                    # Superadmin sees all sites
                    c.execute("""
                        SELECT 
                            s.id AS site_id,
                            s.name AS site_name,
                            s.running_cost,
                            COALESCE(SUM(p.cost_price), 0) AS total_revenue,
                            COALESCE(SUM(p.cost_price), 0) - s.running_cost AS net_profit
                        FROM sites s
                        LEFT JOIN services sv ON s.id = sv.site_id
                        LEFT JOIN products p ON sv.product_id = p.id
                        GROUP BY s.id, s.name, s.running_cost
                        ORDER BY s.name ASC
                    """)
                rows = c.fetchall()
                col_names = [c[0] for c in c.description]
                return [dict(zip(col_names, row)) for row in rows]
        finally:
            con.close()

    # DB OPS WITH SITES
    # Save a new site
    def save_site(self, name, street, suburb, running_cost):
        con = self.get_connection()
        
        try:
            with con.cursor() as c:
                c.execute(
                    'INSERT INTO sites (name, street, suburb, running_cost) VALUES (%s, %s, %s, %s)', (name, street, suburb, running_cost)
                ) 
                con.commit()
                return c.lastrowid
        finally:
            con.close()
    
    # Get all sites to display on /sites route
    def get_all_sites(self):
        con = self.get_connection()

        try:
            with con.cursor() as c:
                c.execute(
                    'SELECT * FROM sites;'
                )
                rows = c.fetchall()
                col_names = [c[0] for c in c.description]
                return [dict(zip(col_names, row)) for row in rows]
        finally:
            con.close()
    
    # Get a site by name
    def get_site_by_name(self, name):
        con = self.get_connection()

        try:
            with con.cursor() as c:
                c.execute(
                    'SELECT * FROM sites WHERE name = %s', (name,)
                )
                return c.fetchone()
        finally:
            con.close()

    # Get a site by id
    def get_site_by_id(self, id):
        con = self.get_connection()

        try:
            with con.cursor() as c:
                c.execute(
                    'SELECT * FROM sites WHERE id = %s', (id,)
                )
                row = c.fetchone()
                col_names = [c[0] for c in c.description]
                return dict(zip(col_names, row))
        finally:
            con.close()
    
    # Edit a site
    def edit_site(self, id, name, street, suburb, running_cost):
        con = self.get_connection()

        try:
            with con.cursor() as c:
                c.execute(
                    'UPDATE sites SET name = %s, street = %s, suburb = %s, running_cost = %s WHERE id = %s', (name, street, suburb, running_cost, id)
                )
                con.commit()
                # print("c.rowcount:", c.rowcount)
                return c.rowcount
        finally:
            con.close()
    
    # Delete a site
    def delete_site(self, site_id):
        con = self.get_connection()

        try:
            with con.cursor() as c:
                c.execute("DELETE FROM sites WHERE id = %s", (site_id,))
                con.commit()
                return c.rowcount > 0
        except Exception as e:
            print("DB error:", e)
            return False
        finally:
            con.close()

    #DB ops with products    
    # Save a new product
    def save_product(self, name, selling_price, cost_price):
        con = self.get_connection()

        try:
            with con.cursor() as c:
                c.execute(
                    'INSERT INTO products (name, selling_price, cost_price) VALUES (%s, %s, %s)', (name, cost_price, selling_price)
                ) 
                con.commit()
                return c.lastrowid
        finally:
            con.close()
        
     # Get all products to display on /products route
    def get_all_products(self):
        con = self.get_connection()
        try:
            with con.cursor() as c:
                c.execute(
                    'SELECT * FROM products;'
                )
                rows = c.fetchall()
                col_names = [c[0] for c in c.description]
                return [dict(zip(col_names, row)) for row in rows]
        finally:
            con.close()
    
    # Get a product by name
    def get_product_by_name(self, name):
        con = self.get_connection()

        try:
            with con.cursor() as c:
                c.execute(
                    'SELECT * FROM products WHERE name = %s', (name,)
                )
                return c.fetchone()
        finally:
            con.close()
    
    # Get a product by id
    def get_product_by_id(self, id):
        con = self.get_connection()

        try:
            with con.cursor() as c:
                c.execute(
                    'SELECT * FROM products WHERE id = %s', (id,)
                )
                row = c.fetchone()
                col_names = [c[0] for c in c.description]
                return dict(zip(col_names, row))
        finally:
            con.close()
    
    # Edit a product
    def edit_product(self, id, name, selling_price, cost_price):
        con = self.get_connection()

        try:
            with con.cursor() as c:
                c.execute(
                    'UPDATE products SET name = %s, selling_price = %s, cost_price = %s WHERE id = %s', (name, selling_price, cost_price, id)
                )
                con.commit()
                # print("c.rowcount:", c.rowcount)
                return c.rowcount
        finally:
            con.close()
    
    # Delete a product
    def delete_product(self, product_id):
        con = self.get_connection()
        
        try:
            with con.cursor() as c:
                c.execute("DELETE FROM products WHERE id = %s", (product_id,))
                con.commit()
                return c.rowcount > 0
        except Exception as e:
            print("DB error:", e)
            return False
        finally:
            con.close()
        
    # DB ops with services
    # Save a new service
    def save_service(self, site_id, unit_number, onu_make, onu_model, onu_serial, onu_number, gpon_serial, status, light_level, pppoe_un, pppoe_pw, ssid_24ghz, password_24ghz, ssid_5gh, password_5ghz, customer_fullname, contact_number, email, debit_order_status, fluent_living, product_id, activation_date, comments):
        con = self.get_connection()

        try:
            with con.cursor() as c:
                c.execute(
                    'INSERT INTO services (site_id, unit_number, onu_make, onu_model, onu_serial, onu_number, gpon_serial,status, light_level, pppoe_un, pppoe_pw, ssid_24ghz, password_24ghz, ssid_5ghz, password_5ghz, customer_fullname, contact_number, email, debit_order_status, fluent_living, product_id, activation_date, comments) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s,%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)', (site_id, unit_number, onu_make, onu_model, onu_serial, onu_number, gpon_serial,status, light_level, pppoe_un, pppoe_pw, ssid_24ghz, password_24ghz, ssid_5gh, password_5ghz, customer_fullname, contact_number, email, debit_order_status, fluent_living, product_id, activation_date, comments)
                ) 
                con.commit()
                return c.lastrowid
        finally:
            con.close()
    
    # Get all services to display on /services route
    def get_all_services(self):
        con = self.get_connection()
        try:
            with con.cursor() as c:
                c.execute("""
                    SELECT 
                        s.*, 
                        si.name AS site_name, 
                        p.name AS product_name
                    FROM services s
                    JOIN sites si ON s.site_id = si.id
                    JOIN products p ON s.product_id = p.id
                    ORDER BY 
                        si.name,
                        REGEXP_SUBSTR(s.unit_number, '^[A-Za-z]+'),
                        CAST(REGEXP_SUBSTR(s.unit_number, '[0-9]+') AS UNSIGNED)
                """)
                rows = c.fetchall()
                col_names = [c[0] for c in c.description]
                return [dict(zip(col_names, row)) for row in rows]
        finally:
            con.close()
    
    # Get a service by name
    def verify_service(self, site_id, unit_number):
        con = self.get_connection()
        
        try:
            with con.cursor() as c:
                c.execute(
                    'SELECT * FROM services WHERE site_id = %s AND unit_number = %s', (site_id, unit_number)
                )
                return c.rowcount
        finally:
            con.close()

    # Delete a service
    def delete_service(self, service_id):
        con = self.get_connection()
        
        try:
            with con.cursor() as c:
                c.execute("DELETE FROM services WHERE id = %s", (service_id,))
                con.commit()
                return c.rowcount > 0
        except Exception as e:
            print("DB error:", e)
            return False
        finally:
            con.close()

    # Get a service by id
    def get_service_by_id(self, id):
        con = self.get_connection()

        try:
            with con.cursor() as c:
                c.execute(
                    'SELECT * FROM services WHERE id = %s', (id,)
                )
                row = c.fetchone()
                col_names = [c[0] for c in c.description]
                return dict(zip(col_names, row))
        finally:
            con.close()

    # Edit a service
    def edit_service(self, service_id, **kwargs):
        """
        Edit a service in the database.

        Parameters
        ----------
        service_id : int
            The ID of the service to edit
        **kwargs : dict
            The fields to edit and their new values. The fields must be valid
            columns in the services table.

        Returns
        -------
        int
            The number of rows affected (1 if the update was successful, 0 otherwise)
        """
        con = self.get_connection()
        set_clause = ', '.join([f"{key} = %s" for key in kwargs.keys()])
        values = list(kwargs.values())

        try:
            with con.cursor() as c:
                c.execute(
                    f'UPDATE services SET {set_clause} WHERE id = %s',
                    values + [service_id]
                )
                con.commit()
                # print("c.rowcount:", c.rowcount)
                return c.rowcount
        finally:
            con.close()

    def pie_chart_data(self):
        con = self.get_connection()
        try:
            with con.cursor() as c:
                c.execute("""
                    SELECT 
                        sites.name AS site_name,
                        products.name AS package_name,
                        COUNT(*) AS value
                    FROM services
                    JOIN sites ON services.site_id = sites.id
                    JOIN products ON services.product_id = products.id
                    GROUP BY sites.name, products.name
                """)
                rows = c.fetchall()
                col_names = [col[0] for col in c.description]
                return [dict(zip(col_names, row)) for row in rows]
        finally:
            con.close()


    def pie_chart_data_for_user(self, user_id):
        con = self.get_connection()
        try:
            with con.cursor() as c:
                c.execute("""
                    SELECT 
                        sites.name AS site_name,
                        products.name AS package_name,
                        COUNT(*) AS value
                    FROM services
                    JOIN sites ON services.site_id = sites.id
                    JOIN products ON services.product_id = products.id
                    JOIN client_site_access ON client_site_access.site_id = sites.id
                    WHERE client_site_access.user_id = %s
                    GROUP BY sites.name, products.name
                """, (user_id,))
                rows = c.fetchall()
                col_names = [col[0] for col in c.description]
                return [dict(zip(col_names, row)) for row in rows]
        finally:
            con.close()


    def services_per_site(self, site):
        con = self.get_connection()
        try:
            with con.cursor() as c:
                c.execute("""
                     SELECT 
                        s.id,
                        si.name AS site_name,
                        p.name AS package,
                        p.cost_price,
                        p.selling_price,
                        s.status,
                        s.unit_number,
                        s.activation_date
                    FROM services s
                    JOIN sites si ON s.site_id = si.id
                    JOIN products p ON s.product_id = p.id
                    WHERE si.name = %s
                    ORDER BY 
                        REGEXP_SUBSTR(s.unit_number, '^[A-Za-z]+'),
                        CAST(REGEXP_SUBSTR(s.unit_number, '[0-9]+') AS UNSIGNED)   
                """, (site,))
    
                rows = c.fetchall()
                # print("Query result:", rows)
                col_names = [c[0] for c in c.description]
                return [dict(zip(col_names, row)) for row in rows]
        finally:
            con.close()

    def get_fluent_living(self, site):
        con = self.get_connection()
        try:
            with con.cursor() as c:
                c.execute("""
                    SELECT 
                        si.name AS site_name, 
                        p.name AS package,
                        s.unit_number,
                        s.customer_fullname,
                        s.ssid_24ghz,
                        s.password_24ghz,
                        s.ssid_5ghz,
                        s.password_5ghz
                    FROM services s
                    JOIN sites si ON s.site_id = si.id
                    JOIN products p ON s.product_id = p.id
                    WHERE s.fluent_living = 1 AND si.name = %s
                    """, (site,))
                rows = c.fetchall()
                # print("Query result:", rows)
                col_names = [c[0] for c in c.description]
                return [dict(zip(col_names, row)) for row in rows]
        finally:
            con.close()

    def assign_sites_to_user(self, user_id, site_ids):
        con = self.get_connection()

        try:
            with con.cursor() as c:
                # Step 1: Remove existing assignments
                c.execute("DELETE FROM client_site_access WHERE user_id = %s", (user_id,))

                # Step 2: Insert new assignments
                if site_ids:
                    values = [(user_id, site_id) for site_id in site_ids]
                    c.executemany(
                        "INSERT INTO client_site_access (user_id, site_id) VALUES (%s, %s)",
                        values
                    )
            con.commit()
            return len(site_ids)
        finally:
            con.close()

    def get_accessible_sites(self, user_id, role):
        """
        Returns list of sites accessible by the given user_id.
        Admin/Staff get all sites; Clients get only assigned sites.
        """
        con = self.get_connection()
        try:
            with con.cursor() as c:
                c.execute("""
                    SELECT s.* 
                    FROM sites s
                    INNER JOIN client_site_access csa ON s.id = csa.site_id
                    WHERE csa.user_id = %s
                    ORDER BY s.name
                """, (user_id,))
            rows = c.fetchall()
            col_names = [col[0] for col in c.description]
            return [dict(zip(col_names, row)) for row in rows]
        finally:
            con.close()


    def log_action(self, user_id, action, target_table=None, target_id=None, details=None):
        con = self.get_connection()
        
        ip_address = request.remote_addr
        user_agent = request.headers.get('User-Agent')
        timestamp = datetime.now()

        try:
            with con.cursor() as c:
                query = """
                    INSERT INTO user_logs (user_id, action, target_table, target_id, ip_address, user_agent, timestamp, details)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                """
                c.execute(query, (user_id, action, target_table, target_id, ip_address, user_agent, timestamp, details))
                con.commit()
                return c.lastrowid
        finally:
            con.close()

    def get_logs(self):
        con = self.get_connection()

        try:
            with con.cursor() as c:
                query = """
                    SELECT id, user_id, action, target_table, target_id, ip_address, timestamp, details
                    FROM user_logs
                    ORDER BY timestamp DESC
                    LIMIT 100
                """
                c.execute(query)
                logs = c.fetchall()
                col_names = [c[0] for c in c.description]
                return [dict(zip(col_names, log)) for log in logs]
        finally:
            con.close()

    def save_mail(self, site, subject, body_text, user_id):
        con = self.get_connection()

        try:
            with con.cursor() as c:
                c.execute(
                    "INSERT INTO bulk_emails (site_id, subject, body, sent_by) VALUES (%s, %s, %s, %s)", (site, subject, body_text, user_id)
                )
                con.commit()
                return c.lastrowid
        finally:
            con.close()

    def get_last_bulk_emails(self, limit=20):
        con = self.get_connection()

        try:
            with con.cursor() as c:  
                sql = """
                    SELECT 
                        b.id,
                        b.subject,
                        b.body,
                        b.sent_at,
                        s.name AS site_name,
                        CONCAT(u.name, ' ', u.surname) AS sent_by_name
                    FROM bulk_emails b
                    JOIN sites s ON b.site_id = s.id
                    JOIN users u ON b.sent_by = u.id
                    ORDER BY b.sent_at DESC
                    LIMIT %s
                """
                c.execute(sql, (limit))
                rows = c.fetchall()
                col_names = [c[0] for c in c.description]
                return [dict(zip(col_names, row)) for row in rows]
                # return c.fetchall()
        finally:
            con.close()
