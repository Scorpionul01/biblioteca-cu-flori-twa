#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
🤖 ANTRENARE MODEL NOU - Biblioteca cu Flori
===============================================
Script care antrenează un model nou funcțional pentru proiectul TWA
"""

import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report
import pickle
import json
import os
from datetime import datetime
from pathlib import Path

def create_training_data():
    """Creează dataset de antrenare cu expresii românești"""
    
    training_data = [
        # ROMANTIC
        ('te iubesc', 'romantic'),
        ('te ador', 'romantic'),
        ('ești dragostea vieții mele', 'romantic'),
        ('pentru iubita mea', 'romantic'),
        ('dragostea mea', 'romantic'),
        ('sufletul meu', 'romantic'),
        ('inima mea', 'romantic'),
        ('pentru cea mai frumoasă', 'romantic'),
        ('iubirea mea eternă', 'romantic'),
        ('pentru dragul meu', 'romantic'),
        ('îmi ești totul', 'romantic'),
        ('ești tot ce îmi doresc', 'romantic'),
        ('pasiunea mea', 'romantic'),
        ('romantism pur', 'romantic'),
        ('dragoste adevărată', 'romantic'),
        
        # SYMPATHY
        ('să se odihnească în pace', 'sympathy'),
        ('condoleanțe sincere', 'sympathy'),
        ('îmi pare foarte rău', 'sympathy'),
        ('gândurile mele sunt cu voi', 'sympathy'),
        ('compasiunea mea', 'sympathy'),
        ('în memoria celui plecat', 'sympathy'),
        ('dumnezeu să îl odihnească', 'sympathy'),
        ('să se odihănească', 'sympathy'),
        ('doliu și tristețe', 'sympathy'),
        ('în semn de respect', 'sympathy'),
        ('ultimul omagiu', 'sympathy'),
        ('drum lin spre ceruri', 'sympathy'),
        ('pace sufletului', 'sympathy'),
        ('condoleanțe familiei', 'sympathy'),
        ('în memoria ta', 'sympathy'),
        
        # BIRTHDAY
        ('la mulți ani', 'birthday'),
        ('zi de naștere fericită', 'birthday'),
        ('aniversare fericită', 'birthday'),
        ('să îți trăiești', 'birthday'),
        ('multe bucurii în noul an', 'birthday'),
        ('sănătate și fericire', 'birthday'),
        ('zi frumoasă de naștere', 'birthday'),
        ('celebrează frumos', 'birthday'),
        ('să ai parte de tot ce îți dorești', 'birthday'),
        ('aniversarea ta', 'birthday'),
        ('ziua ta specială', 'birthday'),
        ('să creezi amintiri frumoase', 'birthday'),
        ('bucurie și veselie', 'birthday'),
        ('toate gândurile bune', 'birthday'),
        ('să fie un an minunat', 'birthday'),
        
        # FRIENDSHIP
        ('pentru prietena mea', 'friendship'),
        ('prietenie adevărată', 'friendship'),
        ('cei mai buni prieteni', 'friendship'),
        ('mulțumesc că ești prietenul meu', 'friendship'),
        ('prietenia noastră', 'friendship'),
        ('pentru colegii mei', 'friendship'),
        ('prietenie de durată', 'friendship'),
        ('pentru cel mai bun prieten', 'friendship'),
        ('amiciție sinceră', 'friendship'),
        ('pentru toate momentele frumoase', 'friendship'),
        ('prieteni pentru totdeauna', 'friendship'),
        ('amintiri comune', 'friendship'),
        ('sprijin și prietenie', 'friendship'),
        ('legătura noastră specială', 'friendship'),
        ('pentru un prieten drag', 'friendship'),
        
        # GRATITUDE
        ('mulțumesc din suflet', 'gratitude'),
        ('recunoștință profundă', 'gratitude'),
        ('sunt foarte recunoscător', 'gratitude'),
        ('apreciez tot ce ai făcut', 'gratitude'),
        ('mulțumire sincerã', 'gratitude'),
        ('gratitudine enormă', 'gratitude'),
        ('îți mulțumesc pentru tot', 'gratitude'),
        ('nu știu cum să îți mulțumesc', 'gratitude'),
        ('recunoștința mea', 'gratitude'),
        ('apreciere infinită', 'gratitude'),
        ('mulțumesc pentru ajutor', 'gratitude'),
        ('datorez mult', 'gratitude'),
        ('nemărginită recunoștință', 'gratitude'),
        ('mulțumesc pentru sprijin', 'gratitude'),
        ('admirație și recunoștință', 'gratitude'),
        
        # APOLOGY
        ('îmi cer scuze', 'apology'),
        ('îmi pare rău pentru greșeala mea', 'apology'),
        ('iertare pentru comportament', 'apology'),
        ('scuze sincere', 'apology'),
        ('regret profund', 'apology'),
        ('îmi asum vina', 'apology'),
        ('mă cac pentru ceea ce am făcut', 'apology'),
        ('iertă-mă te rog', 'apology'),
        ('recunosc că am greșit', 'apology'),
        ('îmi pare foarte rău', 'apology'),
        ('scuze pentru necugetare', 'apology'),
        ('regret și pãrerea de rău', 'apology'),
        ('cere iertare', 'apology'),
        ('mea culpa', 'apology'),
        ('îmi pare rău din suflet', 'apology'),
        
        # CELEBRATION
        ('felicitări pentru succes', 'celebration'),
        ('sărbătorește frumos', 'celebration'),
        ('bucurie și sărbătoare', 'celebration'),
        ('pentru reușita ta', 'celebration'),
        ('celebrare mare', 'celebration'),
        ('succes meritat', 'celebration'),
        ('felicitări din inimă', 'celebration'),
        ('pentru victoria ta', 'celebration'),
        ('realizare extraordinară', 'celebration'),
        ('mândrie și bucurie', 'celebration'),
        ('pentru această zi specială', 'celebration'),
        ('moment de glorie', 'celebration'),
        ('festivitate și bucurie', 'celebration'),
        ('sărbătoare în cinstea ta', 'celebration'),
        ('pentru performanța ta', 'celebration'),
        
        # MOTHERSDAY
        ('pentru cea mai bună mamă', 'mothersday'),
        ('ziua mamei fericită', 'mothersday'),
        ('mamă dragă', 'mothersday'),
        ('pentru mama mea iubită', 'mothersday'),
        ('mamica mea', 'mothersday'),
        ('iubirea de mamă', 'mothersday'),
        ('recunoștință către mamă', 'mothersday'),
        ('mama mea minunată', 'mothersday'),
        ('pentru grija ta maternă', 'mothersday'),
        ('cea mai frumoasă mamă', 'mothersday'),
        ('dragoste de copil', 'mothersday'),
        ('mulțumesc mamă', 'mothersday'),
        ('sacrificiile unei mame', 'mothersday'),
        ('iubire necondiționată', 'mothersday'),
        ('pentru tot ce ai făcut', 'mothersday'),
        
        # WELLNESS
        ('însănătoșire grabnică', 'wellness'),
        ('sănătate și putere', 'wellness'),
        ('să te simți mai bine', 'wellness'),
        ('recuperare rapidă', 'wellness'),
        ('să îți revii repede', 'wellness'),
        ('energie pozitivă', 'wellness'),
        ('vindecarea ta', 'wellness'),
        ('să te refaci complet', 'wellness'),
        ('sănătate deplină', 'wellness'),
        ('forță și curaj', 'wellness'),
        ('să te îndreptăți', 'wellness'),
        ('gânduri de vindecare', 'wellness'),
        ('să fii din nou sănătos', 'wellness'),
        ('recuperare completă', 'wellness'),
        ('să îți revin puterile', 'wellness')
    ]
    
    return training_data

def train_model():
    """Antrenează un model nou funcțional"""
    
    print("🤖 ANTRENARE MODEL NOU PENTRU TWA")
    print("=" * 50)
    
    # Creează datele de antrenare
    print("📋 Creez dataset de antrenare...")
    training_data = create_training_data()
    
    # Convertește în DataFrame
    df = pd.DataFrame(training_data, columns=['text', 'category'])
    print(f"✅ Dataset creat cu {len(df)} exemple")
    print(f"📊 Categorii: {df['category'].unique()}")
    print(f"📈 Distribuția categoriilor:")
    print(df['category'].value_counts())
    
    # Pregătește datele
    X = df['text'].values
    y = df['category'].values
    
    # Împarte datele pentru antrenare și testare
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    print(f"\n🔄 Antrenare: {len(X_train)} exemple")
    print(f"🧪 Testare: {len(X_test)} exemple")
    
    # Creează vectorizer-ul TF-IDF
    print("\n📐 Creez TF-IDF Vectorizer...")
    vectorizer = TfidfVectorizer(
        max_features=5000,
        stop_words=None,  # Păstrăm cuvintele românești
        lowercase=True,
        ngram_range=(1, 2),  # Unigrams și bigrams
        min_df=1,
        max_df=0.95
    )
    
    # Vectorizează textele
    X_train_vec = vectorizer.fit_transform(X_train)
    X_test_vec = vectorizer.transform(X_test)
    
    # Creează label encoder
    print("🏷️ Creez Label Encoder...")
    label_encoder = LabelEncoder()
    y_train_encoded = label_encoder.fit_transform(y_train)
    y_test_encoded = label_encoder.transform(y_test)
    
    # Antrenează modelul
    print("🧠 Antrenez Random Forest Classifier...")
    model = RandomForestClassifier(
        n_estimators=100,
        max_depth=20,
        min_samples_split=2,
        min_samples_leaf=1,
        random_state=42,
        n_jobs=-1
    )
    
    model.fit(X_train_vec, y_train_encoded)
    
    # Testează modelul
    print("\n🧪 Testez modelul...")
    y_pred = model.predict(X_test_vec)
    accuracy = accuracy_score(y_test_encoded, y_pred)
    
    print(f"✅ Acuratețe: {accuracy:.2%}")
    
    # Raport detaliat
    print("\n📊 Raport clasificare:")
    print(classification_report(
        y_test_encoded, y_pred, 
        target_names=label_encoder.classes_,
        zero_division=0
    ))
    
    # Testează cu exemple specifice
    print("\n🔍 Test cu exemple românești:")
    test_examples = [
        'să se odihnească în pace',
        'te iubesc',
        'la mulți ani',
        'mulțumesc din suflet',
        'îmi cer scuze'
    ]
    
    for example in test_examples:
        example_vec = vectorizer.transform([example])
        prediction = model.predict(example_vec)[0]
        confidence = np.max(model.predict_proba(example_vec))
        category = label_encoder.inverse_transform([prediction])[0]
        print(f"'{example}' → {category} ({confidence:.2f})")
    
    return model, vectorizer, label_encoder, accuracy

def save_model(model, vectorizer, label_encoder, accuracy):
    """Salvează modelul în format compatibil"""
    
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    model_dir = Path(f'models/fresh_model_{timestamp}')
    model_dir.mkdir(parents=True, exist_ok=True)
    
    print(f"\n💾 Salvez modelul în: {model_dir}")
    
    try:
        # Salvează cu protocol pickle standard
        with open(model_dir / 'rf_classifier.pkl', 'wb') as f:
            pickle.dump(model, f, protocol=pickle.HIGHEST_PROTOCOL)
        print("✅ Model salvat")
        
        with open(model_dir / 'tfidf_vectorizer.pkl', 'wb') as f:
            pickle.dump(vectorizer, f, protocol=pickle.HIGHEST_PROTOCOL)
        print("✅ Vectorizer salvat")
        
        with open(model_dir / 'label_encoder.pkl', 'wb') as f:
            pickle.dump(label_encoder, f, protocol=pickle.HIGHEST_PROTOCOL)
        print("✅ Label encoder salvat")
        
        # Salvează informațiile modelului
        model_info = {
            'timestamp': timestamp,
            'accuracy': float(accuracy),
            'categories': list(label_encoder.classes_),
            'training_samples': len(create_training_data()),
            'model_type': 'RandomForestClassifier',
            'vectorizer_type': 'TfidfVectorizer',
            'fresh_model': True,
            'compatible': True
        }
        
        with open(model_dir / 'model_info.json', 'w', encoding='utf-8') as f:
            json.dump(model_info, f, indent=2, ensure_ascii=False)
        print("✅ Informații model salvate")
        
        return model_dir
        
    except Exception as e:
        print(f"❌ Eroare la salvare: {str(e)}")
        return None

def test_loading(model_dir):
    """Testează că modelul se poate încărca corect"""
    
    print(f"\n🧪 Testez încărcarea din: {model_dir}")
    
    try:
        # Încearcă să încarce toate componentele
        with open(model_dir / 'rf_classifier.pkl', 'rb') as f:
            loaded_model = pickle.load(f)
        print("✅ Model încărcat cu succes")
        
        with open(model_dir / 'tfidf_vectorizer.pkl', 'rb') as f:
            loaded_vectorizer = pickle.load(f)
        print("✅ Vectorizer încărcat cu succes")
        
        with open(model_dir / 'label_encoder.pkl', 'rb') as f:
            loaded_encoder = pickle.load(f)
        print("✅ Label encoder încărcat cu succes")
        
        # Test funcțional
        test_text = "să se odihnească în pace"
        text_vec = loaded_vectorizer.transform([test_text])
        prediction = loaded_model.predict(text_vec)[0]
        confidence = np.max(loaded_model.predict_proba(text_vec))
        category = loaded_encoder.inverse_transform([prediction])[0]
        
        print(f"🎯 Test funcțional: '{test_text}' → {category} ({confidence:.2f})")
        
        if category == 'sympathy':
            print("🎉 MODELUL FUNCȚIONEAZĂ PERFECT!")
            return True
        else:
            print("⚠️ Predicția nu este corectă")
            return False
            
    except Exception as e:
        print(f"❌ Eroare la încărcare: {str(e)}")
        return False

def create_latest_symlink(model_dir):
    """Creează un symlink către modelul nou în models/latest"""
    
    latest_dir = Path('models/latest')
    
    try:
        # Șterge directorul existent
        if latest_dir.exists():
            import shutil
            shutil.rmtree(latest_dir)
        
        # Copiază modelul nou
        import shutil
        shutil.copytree(model_dir, latest_dir)
        print(f"✅ Model copiat în models/latest")
        
    except Exception as e:
        print(f"⚠️ Nu s-a putut crea models/latest: {str(e)}")

def main():
    """Funcția principală"""
    
    try:
        # Antrenează modelul
        model, vectorizer, label_encoder, accuracy = train_model()
        
        # Salvează modelul
        model_dir = save_model(model, vectorizer, label_encoder, accuracy)
        
        if model_dir:
            # Testează încărcarea
            if test_loading(model_dir):
                # Creează latest symlink
                create_latest_symlink(model_dir)
                
                print("\n🎉 SUCCES COMPLET!")
                print(f"📁 Model salvat în: {model_dir}")
                print("📁 Model copiat în: models/latest")
                print("\n🔄 Următorii pași:")
                print("1. Restartează AI Model Bridge")
                print("2. Testează cu: curl -X POST http://localhost:5001/api/classify -H \"Content-Type: application/json\" -d '{\"message\": \"să se odihnească în pace\"}'")
                
                return True
            else:
                print("❌ Modelul nu funcționează corect")
                return False
        else:
            print("❌ Nu s-a putut salva modelul")
            return False
            
    except Exception as e:
        print(f"❌ Eroare critică: {str(e)}")
        return False

if __name__ == '__main__':
    print("🚀 ÎNCEPE ANTRENAREA MODELULUI NOU")
    print("=" * 50)
    
    # Verifică că suntem în directorul corect
    if not Path('models').exists():
        print("📁 Creez directorul models...")
        Path('models').mkdir(exist_ok=True)
    
    success = main()
    
    if success:
        print("\n🎊 GATA! Modelul nou este pregătit!")
    else:
        print("\n💥 CEVA NU A MERS BINE! Verifică erorile de mai sus.")
    
    print("\nApasă ENTER pentru a închide...")
    input()