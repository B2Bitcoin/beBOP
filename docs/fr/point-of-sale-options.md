# Point of Sale option

## Introduction

beBOP vous permet à la fois d'interagir avec votre communauté sur internet, mais également d'être utilisé comme logiciel de caisse (en stand ou magasin).

POS : Point Of Sale (point de vente, pour avoir un comportement de caisse de magasin)

En utilsant le rôle POS et en l'affectant à un profil [team-access-management.md](team-access-management.md), vous pouvez donner à un profil de caisse des options supplémentaires pour des options d'achat spécifique.
L'utilisation du compte POS permet également d'avoir un affichage client pour afficher :
- une page d'accueil
- l'affichage du panier au fur et à mesure
- le QR code de paiement (Bitcoin, Lightning ou CB Sum Up) une fois la commande validée
- une page de validation une fois le paiement validé

## La gestion du compte POS

Le rôle point-of-sale est configuré par défaut dans le module /admin/arm :

![image](https://github.com/B2Bitcoin/beBOP/assets/50206014/33f053f0-2788-420d-a0a1-78a7b63a83a2)

## Connexion au compte POS

Une fois attribué à un profil, la personne possédant les accès POS doit se rendre sur la page d'identification dans l'administration (/admin/login , où /admin est la chaîne sécurisée configurée par le propriétaire du beBOP (voir [back-office-access.md](back-office-access.md) ) puis s'identifier.

![image](https://github.com/B2Bitcoin/beBOP/assets/50206014/0e0f9eef-69cd-4c88-9402-3ed1fd3167e5)

(Dans le cas d'un magasin, il est préférable de choisir un temps de maintien de connexion de "1 day", pour éviter les déconnexions en pleine session de vente)

## L'utilisation du compte POS

Une fois connecté, l'utilisateur POS renvoie vers l'URL /pos :

![image](https://github.com/B2Bitcoin/beBOP/assets/50206014/5adbfc75-9f68-43d7-8b3e-41f62c69f191)

La session /pos/session renvoie vers l'affichage côté client (voir après "Affichage client").
L'affichage des dernières transactions permet d'assurer le SAV en cas de demande client.
Si le compte POS a été configuré ainsi dans l'ARM, il peut mauellement accéder aux pages /admin dans un autre onglet.

## Ajout panier

Les produits accessibles au compte POS sont ceux qui sont configurés ainsi dans le product canal selector ( [Retail (POS logged seat)](Retail (POS logged seat)) ) :

![image](https://github.com/B2Bitcoin/beBOP/assets/50206014/3532db97-ed8a-4b02-aca1-15952874db22)

Les options activées dans la colonne "Retail (POS logged seat)" s'appliqueront exclusivement au compte POS.

### Navigation par catalogue

La personne gérant la caisse peut ajouter les produits soit :
- par les pages CMS présentant les product widgets (voir [build-cms-pages-with-widget.md](build-cms-pages-with-widget.md) )
- par l'accès à la page /catalog affichant l'intégralité des articles éligibles via le canal selector

Le parcours jusqu'au panier est alors similaire à celui de n'importe quel utilisateur ou utilisatrice sur le web.

### Ajout rapide via Alias

Un alias peut être ajouté à chaque produit ( [product-alias-management.md](product-alias-management.md) ).
Dans le cas où les articles que vous vendez disposent d'un code-barre (type ISBN / EAN13), celui-ci peut être renseigné comme alias.

Au panier, le compte POS dispose d'une option pas affichée chez un utilisateur lambda : en allant directement sur la page panier (/cart), le compte POS dispose d'un champ permettant de renseigner un alias (manuellement, ou via une douchette USB).

![image](https://github.com/B2Bitcoin/beBOP/assets/50206014/b8fcbe75-20ad-4294-be26-d89b8d511f3b)

![image](https://github.com/B2Bitcoin/beBOP/assets/50206014/de6a9a3d-6dd5-48dd-97b3-c78cbcc65673)

Après validation via "entrée" :

![image](https://github.com/B2Bitcoin/beBOP/assets/50206014/15b641e4-62ea-4a6b-9971-853933aa7a91)

Le champ "Alias" est viré pour permettre de scanner l'article suivant plus rapidement.

En cas d'erreur d'ajout panier, l'erreur sera notifiée et le champ Alias sera vidé :
- Nombre de ligne maximum du panier déjà atteint : "Cart has too many items"
- Alias inexistant : "Product not found"
- Stock épuisé : "Product is out of stock"
- Article de type "souscription" ajouté 2 fois : l'article n'est pas ajouté une 2nde fois (les articles de type souscription ont une quantité fixée à 1)
- Article à sortie future mais à pré-commande non-autorisée : "Product is not available for preorder"
- Article avec l'ajout panier désactivé dans le canal selector : "Product can't be added to basket"
- Article avec une quantité limite d'achat par commande donc le maximum est déjà atteint :
  - S'il ne s'agit pas d'un article "Stand alone" : "You can only order X of this product"
  - "Cannot order more than 2 of product: Cheap" (pour l'instant nous avons un bug avec ce contrôle, l'article est ajouté et le message est affiché après refresh panier, et la validation du panier renvoie vers /cart avec le message d'erreur)
- Article à livraison interdite dans votre pays de destination : l'article est ajouté mais le message "La livraison n'est pas disponible dans votre pays pour certains articles de votre panier." est affiché en bas de panier

![image](https://github.com/B2Bitcoin/beBOP/assets/50206014/376b83c9-29fd-485a-8b5d-dccfa1f97813)

A noter qu'en cas d'ajout d'article PWYW via alias, le montant du produit sera le montant minimum configuré sur le produit.

## Spécificités du tunnel (/checkout)

Le compte POS dispose d'options supplémentaires :

![image](https://github.com/B2Bitcoin/beBOP/assets/50206014/f5ee032d-80ab-4ce9-b7d8-69fa778071c4)

### Livraison

Le formulaire d'adresse est optionnel, tant qu'un pays (selon de la boutique) est sélectionné, tous les autres champs sont facultatifs (dans le cas d'un client qui achète, retire directement en magasin et ne requiert pas de facture nomminative).
- Si le client souhaite être livré, le formulaire d'adresse peut être renseigné.
- Si le client souhaite une facture, l'option "Mon adresse de livraison et mon adresse de facturation sont différentes" peut être utilisée pour renseigner la facture.

### Offrir les frais de port
Par défaut, toute commande avec des articles ayant une contrepartie physique sont considérées comme en livraison.
L'administrateur (ou toute autre personne avec accès en écriture à /admin/config ) peut activer cette option dans /admin/config/delivery (voir [delivery-management.md](delivery-management.md) ).

![image](https://github.com/B2Bitcoin/beBOP/assets/50206014/812301c5-99c6-4bcb-8976-474fd15c22d4)

Si l'option "Allow voiding delivery fees on POS sale" est activée, cette option sera disponible sur la page /checkout pour le compte POS :

![image](https://github.com/B2Bitcoin/beBOP/assets/50206014/02e50a5e-e60e-4648-85e8-78026d07b4cc)

En cas d'activation de l'option, une justification obligatoire sera à renseignée, pour suivi managérial :

![image](https://github.com/B2Bitcoin/beBOP/assets/50206014/13d841c0-0d41-47b2-a25d-b5e3015b3873)

La somme (frais de port + tva liée) sera déduite à la page suivante (les prix de la page /checkout ne sont pas encore mis à jour en temps réel en fonction des options POS appliquée).

### Paiement multiple ou paiement magasin

Le compte POS permet d'utiliser :
- les paiements classiques proposés sur le site qui ont été activés et sont éligibles ( [payment-management.md](payment-management.md ) pour l'ensemble des produits du panier 
- le paiement Point of Sale, qui inclut tout paiement extérieur au système beBOP

![image](https://github.com/B2Bitcoin/beBOP/assets/50206014/23185560-a3bf-4aab-8268-dd93fbbea47c)

En cas d'activation de "Utiliser plusieurs modes de paiement", le choix du paiement n'est plus nécessaire (voir "Spécificités de la commande (/order)" ci-après).

En cas d'utilisation d'un paiement classique (CB Sum Up, Lightning ou Bitcoin on-chain), le QR code de paiement sera affiché sur le périphérique client (voir "Affichage côté client" ci-après).
En cas d'utilisation du virement bancaire, la commande sera en suspens et validée une fois le virement reçu manuellement (déconseillé lors d'un paiement en magasin)

En cas d'utilisation du mode de paiement "Point of sale" (paiement unique), le mode d'encaissement sera à renseigner manuellement (voir "Spécificités de la commande (/order)" ci-après).

### Exemption de TVA

Un compte POS peut choisir de facturer sans TVA à un client (par exemple, en France, à une clientèle professionnelle).
⚖️ Votre loi locale doit autoriser l'utilisation de cette option, dont vous êtes responsable.

![image](https://github.com/B2Bitcoin/beBOP/assets/50206014/7936ed4a-8d80-4e4d-bd1a-0090348236d8)

En cas d'activation de l'option, une justification obligatoire sera à renseignée, pour suivi managérial :

![image](https://github.com/B2Bitcoin/beBOP/assets/50206014/f5187336-265e-4b6b-ad2b-8a637b6e46de)

La somme (TVA globale) sera déduite à la page suivante (les prix de la page /checkout ne sont pas encore mis à jour en temps réel en fonction des options POS appliquée).

### Application d'une remise cadeau

Un compte POS peut choisir d'appliquer une réduction à un client :

![image](https://github.com/B2Bitcoin/beBOP/assets/50206014/d0b86f91-5b8b-4059-b909-a4b43cd55abb)

En cas d'activation de l'option, une justification obligatoire sera à renseignée, pour suivi managérial :

![image](https://github.com/B2Bitcoin/beBOP/assets/50206014/92e8c899-f1bd-4afa-ab0f-54e26180324f)

Il faut également choisir le type de réduction :
- en %age (un message d'erreur sera affiché en cas d'entrée invalide, ou de réduction de 100%)
- en montant correspondance à la devise principale du beBOP ( voir [currency-management.md](currency-management.md) ) (un message d'erreur sera affiché en cas d'entrée invalide, ou de réduction de correspondant au total de la commande)

⚖️ Votre loi locale doit autoriser l'utilisation de cette option et ses montants maximum, dont vous êtes responsable (par exemple : loi du prix unique en France)

⚠️ En attendant que les montants soient mis à jour en temps réel sur la page /checkout, attention au cumul réduciton + exemption de TVA + retrait des frais de port.
Le cumul des fonctions, si pas déconseillé, demande un minimum d'attention.

### Autres checkbox clients


## Spécificités de la commande (/order)

### Paiement Point of Sale


### Paiement multiple


## Affichage côté client
