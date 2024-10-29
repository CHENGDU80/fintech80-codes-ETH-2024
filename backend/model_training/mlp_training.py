import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.impute import SimpleImputer
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.metrics import classification_report
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense, Dropout, BatchNormalization
from tensorflow.keras.callbacks import EarlyStopping
import joblib
import numpy as np


file_path = 'train_v4.csv'
dataset = pd.read_csv(file_path)


X = dataset.drop(columns=['ID','Collision Type','Incident Severity','Insurance Cost','Crush'])  # Drop the target column
y = dataset['Crush']  # Define the target


numerical_cols = X.select_dtypes(include=['int64', 'float64']).columns
categorical_cols = X.select_dtypes(include=['object']).columns

numerical_transformer = Pipeline(steps=[
    ('imputer', SimpleImputer(strategy='mean')),
    ('scaler', StandardScaler())  
])

categorical_transformer = Pipeline(steps=[
    ('imputer', SimpleImputer(strategy='most_frequent')),
    ('onehot', OneHotEncoder(handle_unknown='ignore'))
])


preprocessor = ColumnTransformer(
    transformers=[
        ('num', numerical_transformer, numerical_cols),
        ('cat', categorical_transformer, categorical_cols)
    ])


X_processed = preprocessor.fit_transform(X)


preprocessor_path = 'models/mlp_preprocessor.joblib'
joblib.dump(preprocessor, preprocessor_path)
print(f"Preprocessor saved to {preprocessor_path}")


input_shape = X_processed.shape[1]  # Number of features after preprocessing

model = Sequential([
    Dense(64, activation='relu', input_shape=(input_shape,)),
    BatchNormalization(),
    Dropout(0.3),
    Dense(32, activation='relu'),
    BatchNormalization(),
    Dropout(0.3),
    Dense(1, activation='sigmoid')  # Output layer for binary classification
])


model.compile(optimizer='adam',
              loss='binary_crossentropy',
              metrics=['accuracy'])


X_train, X_test, y_train, y_test = train_test_split(X_processed, y, test_size=0.2, random_state=42)


early_stopping = EarlyStopping(monitor='val_loss', patience=5, restore_best_weights=True)

history = model.fit(X_train, y_train,
                    epochs=50,
                    batch_size=32,
                    validation_split=0.2,
                    callbacks=[early_stopping])


y_pred = np.round(model.predict(X_test)).flatten()


print(classification_report(y_test, y_pred))


model_path = 'models/mlp_model_version2.h5'
model.save(model_path)
print(f"MLP Model saved to {model_path}")