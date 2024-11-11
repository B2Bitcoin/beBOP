# Documentation de l'Interface de Gestion de Vente

Cette documentation décrit les fonctionnalités de l'interface tactile (POS Touch Screen) de caisse pour la sélection et la gestion d'articles dans le panier.

---

## Aperçu Général

![image](https://github.com/user-attachments/assets/ce8f6249-ec8b-4439-a24f-159d0cf997b7)

L'interface est divisée en plusieurs sections pour faciliter la gestion des ventes :

1. **Panier** : Affiche les articles sélectionnés par le client.
2. **Favoris et Tags Articles** : Permet de retrouver rapidement les articles.
3. **Tous les Articles** : Affiche tous les articles disponibles.
4. **Actions** : Boutons pour gérer le panier et finaliser la vente.

---

## Configuration

Sur admin/tag pos-favorite est un tag à créer pour afficher par defaut des articles comme favoris au niveau de l'interface /pos/touch

![image](https://github.com/user-attachments/assets/4f08136a-1409-42c0-98b8-16f0e153ad71)

Sur admin/config/pos on peut rajouter des tags pour qu'ils servent de menus sur /pos/touch

![image](https://github.com/user-attachments/assets/21b281cf-a65e-448d-8aac-de797c423b34)

## Description des Sections

### 1. Panier

![image](https://github.com/user-attachments/assets/25fdc955-0d89-4699-9288-3724f222f712)

- **Affichage** : Situé sur le côté gauche de l'interface, cette section montre les articles actuellement dans le panier.
- **État initial** : Affiche "Le panier est vide" lorsque aucun article n'est ajouté.
- **Fonctionnalité** : Permet de visualiser les articles ajoutés ainsi que leur quantité et prix total.
- **Ajout au Panier** : Pour ajouter au panier sur un ecran de point de vente il suffit de cliquer sur l'article

  ![image](https://github.com/user-attachments/assets/e757ef03-d455-4c91-8cdf-f383e210777c)

  et l'article sera ajouter au panier et afficher sur le bloc ticket

  ![image](https://github.com/user-attachments/assets/25fdc955-0d89-4699-9288-3724f222f712)

  lorsqu'un article est ajouté au panier on peut y ajouter une note en cliquant sur le nom de l'article

  ![image](https://github.com/user-attachments/assets/21a9b760-3cc5-42af-8f18-fea374ea573d)

  ![image](https://github.com/user-attachments/assets/9e2c764a-40fc-44d4-b112-c8a3e6334946)

### 2. Favoris et Tags Articles

- **Favoris** : La section `Favoris` en haut de l'interface présente une liste des articles marqués comme favoris pour un accès rapide.

  ![image](https://github.com/user-attachments/assets/c7f14e88-350f-40ba-8f20-da70d3b068b0)

- **Gestion des Favoris** : Vous pouvez marquer des articles en favoris lors de leur création pour faciliter leur accès ultérieur.

- **Tags Articles** : La section sous "Favoris" présente une liste des articles selon differents tag

  ![image](https://github.com/user-attachments/assets/563d0c7f-3f4d-4d57-a9da-5a94000e4989)

### 3. Tous les Articles

- **Affichage des Articles** : Présente une liste de tous les articles disponibles dans le système, organisés avec des images et des noms d'articles.

  ![image](https://github.com/user-attachments/assets/0fd64e7c-8de8-4212-827c-0d3f53a72f37)

### 4. Actions

![image](https://github.com/user-attachments/assets/b7df647e-cf8e-4e78-86ca-4e89478bc1e4)

Cette section regroupe les boutons pour gérer le panier, sauvegarder, ou finaliser une vente :

- **Tickets** : Accède aux tickets de vente en cours.
- **Payer** : Redrige vers la page /checkout pour finaliser la vente des articles présents dans le panier et enregistre la transaction.

  ![image](https://github.com/user-attachments/assets/6f353fce-d587-4a2d-bff2-709f765c3725)

- **Sauver** : Enregistre l'état actuel du panier ou les modifications de paramètres.
- **Pool** : Peut être utilisé pour diviser la commande, gérer des groupes d'articles, ou associer des clients à une commande spécifique.
- **Ouvrir Tiroir** : Ouvre le tiroir-caisse pour accéder aux fonds (nécessite un système physique connecté).
- **🗑️** : Permet de vider le contenu du panier.

  ![image](https://github.com/user-attachments/assets/85888c2d-4696-42cc-9ade-d4bf923a55f7)

- **❎** : Permet de supprimer la dernière ligne du panier.

  ![image](https://github.com/user-attachments/assets/20b9fc00-b128-4bb4-9ed7-ae207f63931f)
