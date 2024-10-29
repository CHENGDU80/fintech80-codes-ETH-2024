from flask import Flask, jsonify, request
from flask_cors import CORS
import json
from rf_inference import predict_rf_model
from svm_inference import predict_svm_model
from mlp_inference import predict_mlp_model
from get_similar_event import get_similar_event

app = Flask(__name__)
CORS(app)

@app.route('/api/hello', methods=['GET'])
def hello():
    return jsonify(message="Hello, World!")


@app.route('/api/model', methods=['POST'])
def wrap_up_function():
    """
    Wrap-up function that runs a specific model inference based on the chosen model.

    Expects:
    - input_csv (file): A CSV file uploaded in the request.
    - model_choice (int): An integer indicating the model to use:
                          1 for SVM model, 2 for RF model, 3 for MLP model.

    Returns:
    - JSON-like dictionary with predictions and similarity results.
    """
    # Get model_choice from the form data
    model_choice = request.form.get('model_choice', type=int)
    
    # Get the uploaded file from the request
    input_csv = request.files.get('input_csv')
    if not input_csv or model_choice not in [1, 2, 3]:
        return jsonify({"error": "Invalid input. Please provide a CSV file and a valid model_choice (1, 2, or 3)."}), 400

    # Save the uploaded CSV file to a temporary location
    input_csv_path = input_csv.filename
    input_csv.save(input_csv_path)

    # Step 1: Generate similarity results
    print("Generating similarity-based results...")
    similarity_result = get_similar_event(input_csv_path)


    # Step 2: Run the selected model's inference and return combined JSON-like result
    if model_choice == 1:
        print("Running SVM model inference...")
        model_result = predict_svm_model(input_csv_path, similarity_result)
    elif model_choice == 2:
        print("Running Random Forest model inference...")
        model_result = predict_rf_model(input_csv_path, similarity_result)
    elif model_choice == 3:
        print("Running MLP model inference...")
        model_result = predict_mlp_model(input_csv_path, similarity_result)
    else:
        return jsonify({"error": "Invalid model choice."}), 400

    # Return the final result as JSON
    return jsonify(model_result)

if __name__ == '__main__':
    app.run(debug=True, host="0.0.0.0")
