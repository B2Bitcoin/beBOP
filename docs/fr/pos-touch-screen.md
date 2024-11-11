# Ecran Tactile Point of Sale

## Introduction

Be-bop propose un ecran tactile au point de vente pour leur permettre de gerer leurs ventes sur des tablettes.
Cet ecran est disponible lorsqu'on est connecté en tant qu'utilisateur POS et se présente comme suit.

![image](https://github.com/user-attachments/assets/ce8f6249-ec8b-4439-a24f-159d0cf997b7)

## Configuration

Sur admin/tag pos-favorite est un tag à créer pour afficher par defaut des articles comme favoris au niveau de l'interface /pos/touch

![image](https://github.com/user-attachments/assets/4f08136a-1409-42c0-98b8-16f0e153ad71)

Sur admin/config/pos on peut rajouter des tags pour qu'ils servent de menus sur /pos/touch

![image](https://github.com/user-attachments/assets/21b281cf-a65e-448d-8aac-de797c423b34)

## Présentation des différentes zones

L'ecran pos est composé :

- d'un menu FAVORIS qui affiche les articles designés avec un tag pos-favorite

  ![image](https://github.com/user-attachments/assets/c7f14e88-350f-40ba-8f20-da70d3b068b0)

- de plusieurs menu POS qui permet d'afficher des articles sous differents tag

  ![image](https://github.com/user-attachments/assets/563d0c7f-3f4d-4d57-a9da-5a94000e4989)

- d'un menu pour afficher tous les articles disponible en mode POS

  ![image](https://github.com/user-attachments/assets/0fd64e7c-8de8-4212-827c-0d3f53a72f37)

- d'un bloc pour afficher les articles ajouter au panier et leur total (bloc ticket)

  ![image](https://github.com/user-attachments/assets/25fdc955-0d89-4699-9288-3724f222f712)

- de boutons pour :

  - payer
  - supprimer le dernier article ajouté
  - vider le panier

  ![image](https://github.com/user-attachments/assets/5cc869d9-0d29-44cd-9f9f-67d73d24e6f6)

- il existe d'autres boutons notament :
  - tickets
  - sauver
  - pool
  - ouvrir tiroir
    qui sont des fonctionnalités à venir

![image](https://github.com/user-attachments/assets/ca874166-bad5-4a69-babe-7fc4940e88e9)

## Fonctionnement ajout panier

Pour ajouter au panier sur un ecran de point de vente il suffit de cliquer sur l'article

![image](https://github.com/user-attachments/assets/e757ef03-d455-4c91-8cdf-f383e210777c)

et l'article sera ajouter au panier et afficher sur le bloc ticket

![image](https://github.com/user-attachments/assets/25fdc955-0d89-4699-9288-3724f222f712)

lorsqu'un article est ajouter au panier on peut y ajouter une note en cliquant sur le nom de l'article

![image](https://github.com/user-attachments/assets/21a9b760-3cc5-42af-8f18-fea374ea573d)

![image](https://github.com/user-attachments/assets/9e2c764a-40fc-44d4-b112-c8a3e6334946)
