# Use Python 3.10
FROM python:3.10

# Set working directory
WORKDIR /code

# Copy requirements and install
COPY ./requirements.txt /code/requirements.txt
RUN pip install --no-cache-dir --upgrade -r /code/requirements.txt

# Create the temp folder for images
RUN mkdir -p /code/generated_assets
RUN chmod 777 /code/generated_assets

# Copy all python files
COPY . .

# Start the app on port 7860 (Hugging Face default)
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860"]