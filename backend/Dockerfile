# Use the official Python image as a base
FROM python:3.12

# Set the working directory
WORKDIR /app

# Copy requirements.txt
COPY requirements.txt ./

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the backend files
COPY . .

# Expose port 5000
EXPOSE 5000

# Start the Flask app
CMD ["flask", "run", "--host=0.0.0.0", "--port=5000"]
