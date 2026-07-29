# SQL Database Implementation Guide

This guide provides step-by-step instructions for setting up the EduMart database on both Linux and Windows systems.

## Prerequisites

- MySQL 8.0+ installed and running
- Basic command-line/terminal knowledge
- Access to the EduMart SQL schema file: `sql/database_schema.sql`

## Linux Implementation Guide (Ubuntu/Debian)

### Step 1: Install MySQL Server (if not already installed)

```bash
# Update package list
sudo apt update

# Install MySQL server
sudo apt install mysql-server

# Start and enable MySQL service
sudo systemctl start mysql
sudo systemctl enable mysql

# Secure MySQL installation (recommended for production)
sudo mysql_secure_installation
```

### Step 2: Log into MySQL

```bash
# Log in as root (you'll be prompted for the password set during installation)
sudo mysql -u root -p

# Or if you prefer to use a specific user:
# mysql -u your_username -p
```

### Step 3: Create the Database

```sql
-- In the MySQL prompt
CREATE DATABASE edumart CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE edumart;
```

### Step 4: Execute the Schema

```sql
-- Assuming you're in the directory containing the SQL file
-- Provide the full path if needed
SOURCE /path/to/EduMart/sql/database_schema.sql;

-- Example if you're in the EduMart directory:
SOURCE sql/database_schema.sql;
```

### Step 5: Verify the Installation

```sql
-- Check that database was created
SHOW DATABASES LIKE 'edumart';

-- Use the database
USE edumart;

-- List all tables
SHOW TABLES;

-- Describe a sample table
DESCRIBE users;

-- Check table count
SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'edumart';
-- Should return 16 tables

-- Verify sample data (if uncommented)
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM products;
```

### Step 6: Create Application User (Recommended for Security)

```sql
-- Create a dedicated user for the application
CREATE USER 'edumart_user'@'localhost' IDENTIFIED BY 'your_strong_password';

-- Grant necessary privileges
GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, ALTER, INDEX ON edumart.* TO 'edumart_user'@'localhost';
FLUSH PRIVILEGES;

-- Exit MySQL
EXIT;
```

### Step 7: Test Connection from Application

Your application should now be able to connect using:
- Host: localhost
- Port: 3306 (default)
- Database: edumart
- Username: edumart_user
- Password: your_strong_password

## Windows Implementation Guide

### Step 1: Install MySQL Server

1. Download MySQL Installer from https://dev.mysql.com/downloads/installer/
2. Run the installer and choose "Developer Default" or "Custom" installation
3. Ensure MySQL Server and MySQL Shell (or Command Line Client) are selected
4. Follow the setup wizard:
   - Set root password (remember it for later)
   - Use MySQL Installer to complete installation
   - Configure MySQL Server as a service (default)
   - Use UTF-8 as default character set (should be default in 8.0+)

### Step 2: Open MySQL Command Line Client

1. Search for "MySQL Command Line Client" in the Start menu
2. Open it and log in as root using the password you set during installation

### Step 3: Create the Database

```sql
-- In the MySQL prompt
CREATE DATABASE edumart CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE edumart;
```

### Step 4: Execute the Schema

You have two options:

**Option A: Using MySQL Command Line Client**
```sql
-- Provide the full path to the SQL file
SOURCE C:\path\to\EduMart\sql\database_schema.sql;

-- Example:
SOURCE C:\Users\YourName\EduMart\sql\database_schema.sql;
```

**Option B: Using Windows Command Prompt**
```bash
# Navigate to the EduMart directory
cd C:\path\to\EduMart

# Execute the schema file
mysql -u root -p edumart < sql\database_schema.sql
# You'll be prompted for the root password
```

### Step 5: Verify the Installation

```sql
-- In MySQL client
SHOW DATABASES LIKE 'edumart';
USE edumart;
SHOW TABLES;
DESCRIBE users;
SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'edumart';
```

### Step 6: Create Application User (Recommended)

```sql
-- Create a dedicated user for the application
CREATE USER 'edumart_user'@'localhost' IDENTIFIED BY 'your_strong_password';

-- Grant necessary privileges
GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, ALTER, INDEX ON edumart.* TO 'edumart_user'@'localhost';
FLUSH PRIVILEGES;

-- Exit MySQL
EXIT;
```

### Step 7: Test Connection from Application

Your Windows application should connect using:
- Host: localhost
- Port: 3306
- Database: edumart
- Username: edumart_user
- Password: your_strong_password

## Troubleshooting

### Common Linux Issues

**ERROR 1045 (28000): Access denied for user 'root'@'localhost'**
- Solution: Use `sudo mysql` if you're using auth_socket plugin, or reset root password

**Can't connect to MySQL server**
- Solution: Check if service is running: `sudo systemctl status mysql`
- Start it: `sudo systemctl start mysql`

**Character set issues**
- Solution: Ensure you created database with `utf8mb4` charset and collation

### Common Windows Issues

**MySQL service not starting**
- Solution: Check Windows Services (services.msc) for MySQL service
- Ensure it's set to start automatically and is running

**Access denied errors**
- Solution: Double-check username/password
- Remember that Windows MySQL might treat 'localhost' differently than IP address

**Path not found when SOURCE command**
- Solution: Use forward slashes or double backslashes in paths:
  - `SOURCE C:/path/to/file.sql;`
  - `SOURCE C:\\path\\to\\file.sql;`

## Verification Checklist

After implementation, verify:
- [ ] Database `edumart` exists with UTF-8 charset
- [ ] All 16 tables are present
- [ ] Primary keys, foreign keys, and indexes are correctly defined
- [ ] Sample data inserted (if you uncommented those sections)
- [ ] Application user can connect and perform basic operations
- [ ] No errors during schema execution

## Next Steps for Development

1. Configure your application's database connection settings
2. Run any necessary migrations if using an ORM (like Sequelize)
3. Test basic CRUD operations on key tables (users, products, orders)
4. Set up automated backups for production environments
5. Consider implementing database connection pooling in your application

## Maintenance Tips

- Regularly run `mysqlcheck` or use MySQL Workbench to check table integrity
- Monitor slow queries with MySQL's slow query log
- Schedule regular backups using `mysqldump` or MySQL Enterprise Backup
- Keep MySQL server updated with security patches
- Consider setting up a read replica for scaling read-heavy operations (catalog browsing, etc.)

## References

- MySQL 8.0 Reference Manual: https://dev.mysql.com/doc/refman/8.0/en/
- MySQL Installation Guide: https://dev.mysql.com/doc/refman/8.0/en/installing.html
- Character Set Support: https://dev.mysql.com/doc/refman/8.0/en/charset.html