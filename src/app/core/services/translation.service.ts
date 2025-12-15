import { Injectable, signal, effect } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export type Language = 'en' | 'ar';

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  private translations: any = {};
  currentLang = signal<Language>('en');
  
  constructor(private http: HttpClient) {
    this.initLanguage();
    
    effect(() => {
      this.loadTranslations(this.currentLang());
      this.applyDirection(this.currentLang());
    });
  }
  
  private initLanguage() {
    const savedLang = localStorage.getItem('language') as Language;
    if (savedLang) {
      this.currentLang.set(savedLang);
    }
  }
  
  private async loadTranslations(lang: Language) {
    try {
      this.translations = await firstValueFrom(this.http.get(`./assets/i18n/${lang}.json`));
    } catch (error) {
      console.error('Failed to load translations', error);
    }
  }
  
  setLanguage(lang: Language) {
    this.currentLang.set(lang);
    localStorage.setItem('language', lang);
  }
  
  private applyDirection(lang: Language) {
    const dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.setAttribute('dir', dir);
    document.documentElement.setAttribute('lang', lang);
  }
  
  translate(key: string): string {
    const keys = key.split('.');
    let value = this.translations;
    
    for (const k of keys) {
      value = value?.[k];
    }
    
    return value || key;
  }
  
  t(key: string): string {
    return this.translate(key);
  }
}
