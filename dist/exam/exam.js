//Écrivez la commande Prisma Client permettant de récupérer un événement (par son ID) avec :
//Les informations de l'organisateur (name et email uniquement)
//Le nombre de billets vendus (via _count)
const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: {
        organizer: {
            select: {
                name: true,
                email: true
            }
        },
        _count: {
            select: { tickets: true },
        }
    }
});
//Créez un middleware de validation pour la création d'un événement qui vérifie :
//Le titre est requis et fait au moins 3 caractères
//La date est une date valide et dans le futur
//Le prix est un nombre positif
//Le nombre total de places est un entier positif supérieur à 0
//Utilisez soit Zod, soit class-validator, soit une validation manuelle (précisez votre choix).
//Si la validation échoue, le middleware doit renvoyer une erreur 400 avec un message explicite.
import { z } from 'zod';
const eventSchema = z.object({
    title: z.string().min(3, "Le titre doit faire au moins 3 caractères"),
    date: z.date().refine(date => date > new Date(), "La date doit être dans le futur"),
    price: z.number().positive("Le prix doit être un nombre positif"),
    totalSeats: z.number().int().positive("Le nombre total de places doit être un entier positif supérieur à 0")
});
async function validateEventCreation(req, res, next) {
    try {
        eventSchema.parse(req.body);
        next();
    }
    catch (error) {
        res.status(400).json({ error: "Validation failed", details: error.message });
    }
}
//Expliquez comment intégrer ce middleware dans une route Express TypeScript pour POST /api/events.
//Montrez l'ordre d'exécution des middlewares :
//Authentification
//Validation
//Contrôleur
//Écrivez la déclaration de la route complète.
import express from 'express';
import { prisma } from './src/lib/prisma';
const router = express.Router();
router.post('/api/events', authenticate, // Vérifie que l'utilisateur est connecté
validateEventCreation, // Vérifie les données
createEvent // Crée l'événement
);
export default router;
Express;
lit;
les;
fonctions;
de;
gauche;
à;
droite;
dans `router.post(...)`.
;
Chaque;
middleware;
doit;
appeler `next()`;
pour;
passer;
au;
suivant.
    Si `authenticate`;
échoue, il;
renvoie `401`;
et;
arrête;
la;
chaîne.
    Si `validateEventCreation`;
échoue, il;
renvoie `400`;
et;
arrête;
la;
chaîne.
;
Si;
tout;
est;
OK, `createEvent`;
s;
'exécute et crée l';
événement.
;
//Créez un middleware d'erreur global qui :
//Capture toutes les erreurs de l'application
//Renvoie un format JSON standardisé :
//{
//"success": false,
//"error": "message d'erreur"
//}
//Gère différemment les erreurs selon leur type :
//Erreurs de validation : status 400
//Erreurs d'authentification : status 401
//Erreurs serveur : status 500
//Affiche les détails de l'erreur en console en mode développement uniquement
function globalErrorHandler(err, req, res, next) {
    console.error(err); // Affiche les détails de l'erreur en console
    // Détection du type d'erreur
    let statusCode = 500;
    let message = "Erreur serveur";
    // Erreurs de validation Zod
    if (err.name === "ZodError") {
        statusCode = 400;
        message = "Erreur de validation";
    }
    // Erreurs d'authentification
    else if (err.name === "UnauthorizedError") {
        statusCode = 401;
        message = "Erreur d'authentification";
    }
    res.status(statusCode).json({
        success: false,
        error: message
    });
}
//Créez une classe d'erreur personnalisée AppError qui :
//Étend la classe Error
//Accepte un message et un code de statut HTTP dans son constructeur
//Montrez comment l'utiliser dans un contrôleur pour refuser l'achat d'un billet si l'événement est
//complet (disponiblePlaces = 0).
class AppError extends Error {
    status;
    constructor(message, status) {
        super(message);
        this.status = status;
    }
}
async function buyTicket(req, res, next) {
    const eventId = req.params.id;
    const event = await prisma.event.findUnique({ where: { id: z.coerce.number().parse(eventId) } });
    if (!event) {
        throw new AppError("Événement non trouvé", 404);
    }
    if (event.availablePlaces === 0) {
        throw new AppError("Événement complet", 400);
    }
}
Écrivez;
une;
fonction;
generateToken(user);
qui;
génère;
un;
token;
JWT;
lors;
de;
la;
connexion;
d;
'un;
utilisateur.
;
Le;
token;
doit;
contenir: userId;
email;
role;
Configurez;
une;
expiration;
de;
24;
heures.
;
Utilisez;
la;
bibliothèque;
jsonwebtoken.
;
import jwt from 'jsonwebtoken';
function generateToken(user) {
    return jwt.sign({ userId: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '24h' });
}
Créez;
un;
middleware;
authMiddleware;
qui: -Extrait;
le;
token;
du;
header;
Authorization: Bearer < token >
    -Vérifie;
la;
validité;
du;
token;
avec;
jwt.verify()
    - Ajoute;
les;
informations;
décodées;
de;
l;
'utilisateur dans req.user
    - Renvoie;
une;
erreur;
401;
si;
le;
token;
est;
invalide, manquant;
ou;
expiré;
N;
'oubliez pas de typer correctement req.user avec TypeScript.;
function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, error: "Token manquant ou invalide" });
    }
    const token = authHeader.substring(7); // Retire "Bearer "
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    }
    catch (error) {
        return res.status(401).json({ success: false, error: "Token invalide ou expiré" });
    }
}
Créez;
un;
middleware;
requireRole(role, string);
qui: Vérifie;
que;
l;
'utilisateur connecté (req.user) possède le rôle requis;
Renvoie;
une;
erreur;
403(Forbidden);
si;
le;
rôle;
ne;
correspond;
pas;
Exemple;
d;
'utilisation : seuls les ORGANIZER peuvent créer des événements;
function requireRole(role) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ success: false, error: "Utilisateur non authentifié" });
        }
        if (req.user.role !== role) {
            return res.status(403).json({ success: false, error: "Accès interdit : rôle insuffisant" });
        }
        next();
    };
}
router.post('/api/events', authMiddleware, // Vérifie que l'utilisateur est connecté
requireRole('ORGANIZER'), // Vérifie que l'utilisateur a le rôle ORGANIZER
validateEventCreation, // Valide les données de l'événement
createEvent // Crée l'événement
);
//# sourceMappingURL=exam.js.map