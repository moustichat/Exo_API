export interface Event {
    title: string,
    description: string,
    date: Date,
    heure: string,
    lieu: string,
    ville: string,
    prix_billet: number,
    nombre_total_places: number,
    categorie: string,
    image_couverture?: unknown;
}