# Point of Sale option

## Introduction

beBOP vous permet à la fois d'interagir avec votre communauté sur internet, mais également d'être utilisé comme logiciel de caisse (en stand ou magasin).

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


## Spécificités de la commande (/order)

## Affichage côté client
