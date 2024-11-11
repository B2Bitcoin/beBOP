# Documentation de l'Interface de Reporting

Cette page permet de consulter et d'exporter des détails sur les commandes, les produits, et les paiements. Elle est accessible via l'onglet **Admin** > **Config** > **Reporting**.

![image](https://github.com/user-attachments/assets/0de30f78-fb01-40e9-96f2-08e6b1af5666)

---

## Fonctionnalités

### 1. Filtres de Reporting

- **Options de Filtrage** : Permet de filtrer les commandes selon leur statut :
  - `Include pending orders` : Inclure les commandes en attente.
  - `Include expired orders` : Inclure les commandes expirées.
  - `Include canceled orders` : Inclure les commandes annulées.
  - `Include partially paid orders` : Inclure les commandes partiellement payées.
- **Utilisation** : Cochez les cases correspondantes pour inclure ces types de commandes dans le reporting.
  Par défaut seul les commandes payés sont listés.

### 2. Order Detail (Détail de Commande)

- **Export CSV** : Permet d'exporter les détails des commandes en format CSV.
- **Tableau des Détails de Commande** :
  - `Order ID` : Identifiant unique de la commande (cliquer dessus pour voir plus de détails).
  - `Order URL` : Lien direct vers la commande.
  - `Order Date` : Date de la commande.
  - `Order Status` : Statut de la commande (ex. : paid, pending).
  - `Currency` : Devise de la transaction.
  - `Amount` : Montant total de la commande.
  - `Billing Country` : Pays de facturation (s’il est disponible).
  - `Billing Info` : Les informations pour l'addresse de facturation.
  - `Shipping Country` : Pays de livraison (s’il est disponible).
  - `Shipping Info` : Les informations pour l'addresse de livraison.
  - `Cart` : les articles dans le panier de la commande

### 3. Product Detail (Détail de Produit)

- **Export CSV** : Permet d'exporter les informations des produits associés aux commandes en format CSV.
- **Tableau des Détails de Produit** :
  - `Product URL` : Lien direct vers le produit.
  - `Product Name` : Nom du produit.
  - `Quantity` : Quantité commandée.
  - `Deposit` : Montant du dépôt pour le produit (si applicable).
  - `Order ID` : Référence de la commande associée.
  - `Order Date` : Date de la commande associée.
  - `Currency` : Devise de la transaction.
  - `Amount` : Montant total pour ce produit.
  - `Vat Rate` : Taux de TVA appliqué.

### 4. Payment Detail (Détail de Paiement)

- **Export CSV** : Permet d'exporter les détails de paiement en format CSV.
- **Tableau des Détails de Paiement** :
  - Affiche les informations concernant les paiements associés aux commandes. Chaque ligne correspond à un paiement effectué pour une commande spécifique.

---

## Exportation des Données

Chaque section (Order Detail, Product Detail, Payment Detail) dispose d'un bouton `Export CSV` permettant de télécharger les données affichées sous forme de fichier CSV.

## Notes Techniques

- **Architecture** : La page de reporting récupère les données en temps réel depuis la base de données, ce qui peut prendre quelques instants si le volume de commandes est élevé.
- **Filtrage Dynamique** : Les options de filtrage permettent aux utilisateurs de personnaliser les rapports selon les besoins d'analyse.

---
