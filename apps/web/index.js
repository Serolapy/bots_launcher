/**
 * @file apps/web/index.js
 * @description Модуль для настройки маршрутизации веб-приложения
 */

import express from 'express';

/**
 * Экземпляр маршрутизатора Express
 * @type {express.Router}
 */
const router = express.Router();

/**
 * Функция для настройки и возврата маршрутизатора веб-приложения
 * @function
 * @returns {express.Router} Настроенный маршрутизатор Express
 */
export default function() {
    // Добавление маршрутов
    router.get('/', (req, res) => {
        res.send('Главная страница');
    });
    return router;
}