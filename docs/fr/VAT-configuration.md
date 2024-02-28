# Gestion des régimes et taux de TVA

## Introduction

Nativement, beBOP affiche des prix hors-taxe.
Les calculs de TVA sont réalisés dès le panier.

Il existe 3 grands régimes de TVA, dont une variation :
- l'exemption sous justification
- la vente sous TVA du pays du vendeur
- la vente sous TVA du pays de l'acheteur
- la vente sous TVA du pays du vendeur avec exonération pour les acheteurs se faisant livrer à l'étranger, sous réserve de déclaration de paiement de la TVA de leur pays auprès de leurs propres services douaniers

Pour contrôle fiscal, respect de la loi et comptabilité, il est parfois nécessaire recueillir des données liées au client, pour justifier une éventuelle exonération de TVA.
Ces points sont abordés dans le [privacy-management.md](/docs/fr/privacy-management.md).
![image](https://github.com/B2Bitcoin/beBOP/assets/50206014/c5363c2c-22cf-4d01-8a9e-d0d3e204bef9)
## Cas 1 : exemption de TVA sur sous justification

Dans /admin/config se trouve l'option **Disable VAT for my beBOP** (*Désactiver la TVA pour mon beBOP*).
Une fois la case activée, **une TVA de 0% est appliquée sur l'ensemble des futures commandes**.
![image](https://github.com/B2Bitcoin/beBOP/assets/50206014/a86a4edd-e70d-466d-b573-ed0ef9e56025)

L'activation de cette option active la sous-option **VAT exemption reason (appears on the invoice)** (*Raison d'exemption de TVA (apparaît sur les factures)*).
Il s'agit du texte légal à renseigner pour justifier de l'absence de TVA à votre client.
Par exemple, en France :
- *TVA non applicable, article 293B du code général des impôts.*
- *Exonération de TVA, article 262 ter, I du CGI*
- *Exonération de TVA, article 298 sexies du CGI*
- *Exonération de TVA, article 283-2 du Code général des impôts".* (prestation de service inter-communautaire)

Le motif renseigné sera alors indiqué sur chacune de vos factures.
![image](https://github.com/B2Bitcoin/beBOP/assets/50206014/e062d151-e141-42a2-88b8-7fffc1a7c0ec)

## Cas 2A : vente au taux de TVA du pays du vendeur

Dans /admin/config se trouve l'option **Use VAT rate from seller's country (always true for products that are digital goods)** (*Utiliser la TVA du pays du vendeur (toujours vrai pour les articles sans livraison)*).
Il faut ensuite choisir le pays auquel est rattaché votre entreprise dans l'option **Seller's country for VAT purposes** (*Pays du vendeur pour définition de la TVA*).

En procédant ainsi :
- le taux de TVA indiqué au panier sera celui du pays de votre entreprise (avec un indicateur rappelant ce pays)
- le taux de TVA indiqué dans la page de tunnel sera celui du pays de votre entreprise (avec un indicateur rappelant ce pays)
- le taux de TVA indiqué sur la commande sera celui du pays de votre entreprise (avec un indicateur rappelant ce pays)
- le taux de TVA indiqué sur la facture sera celui du pays de votre entreprise

## Cas 2B : vente au taux de TVA du pays du vendeur et exonération pour la livraison d'articles physiques à l'étranger

Dans le cas précédent, dans /admin/config, si vous activez l'option **Make VAT = 0% for deliveries outside seller's country** (*Considérez la TVA comme nulle pour les clients livrés en dehors de votre pays*), les règles resteront les mêmes pour les clients se faisant livrer dans le pays de votre entreprise.

Il en sera de même pour l'achat d'articles téléchargeables, de dons ou d'abonnements (le taux de TVA appliqué sera celui du pays de votre entreprise).

En revanche, si votre client veut se faire livrer votre marchandise dans son pays (qui n'est pas celui de votre entreprise) :
- le taux de TVA indiqué au panier sera celui du pays dans lequel est géolocalisé son IP (d'après des données originaires de ip2location.com)
- le taux de TVA indiqué dans la page de tunnel sera celui du pays de livraison choisi par le client
- le taux de TVA indiqué sur la commande sera celui du pays de livraison choisi par le client
- le taux de TVA indiqué sur la facture sera celui du pays de livraison choisi par le client
Même si l'adresse de facturation de votre client est dans le pays de votre entreprise, la livraison à l'étranger, dans certains régimes, peut l'obliger à ce paiement via déclaration au service des douanes dès réception de la marchandise.

Quand cette option est activée, dans le tunnel (page /checkout), le client devra valider une nouvelle option obligatoire : **I understand that I will have to pay VAT upon delivery** (*Je comprends que je devrais payer la VAT au moment de la livraison*).
Le lien de cette option renvoie vers la page CMS /why-vat-customs , à créer et à compléter pour expliquer pourquoi votre client doit s'acquitter de la TVA de son pays dès réception de votre article.

## Cas 3 : vente au taux de TVA du pays de l'acheteur

Quand, dans /amdin/config, aucune option de régime de TVA n'est activée et qu'un pays de TVA est choisi, la TVA appliquée sera celle du client :
- le taux de TVA indiqué au panier sera celui du pays dans lequel est géolocalisé son IP (d'après des données originaires de ip2location.com)
- le taux de TVA indiqué dans la page de tunnel sera celui du pays de livraison choisi par le client, ou celui du pays dans lequel est géolocalisé son IP (d'après des données originaires de ip2location.com) dans le cadre d'un panier sans article nécessitant une livraison
- le taux de TVA indiqué sur la commande sera celui du pays de livraison choisi par le client, ou celui du pays dans lequel est géolocalisé son IP (d'après des données originaires de ip2location.com) dans le cadre d'un panier sans article nécessitant une livraison
- le taux de TVA indiqué sur la facture sera celui du pays de livraison choisi par le client, ou celui du pays dans lequel est géolocalisé son IP (d'après des données originaires de ip2location.com) dans le cadre d'un panier sans article nécessitant une livraison

## L'IP de l'utilisateur utilisée pour l'évaluation de la TVA est-elle stockée ?
Ces points sont abordés dans le [privacy-management.md](/docs/frprivacy-management.md).
Mais, sans autre configuration exigeant des informations du client, l'information n'est pas stockée : elle est récupérée du navigateur (car fournie par ce dernier) et utilisée pour donner une estimation de la TVA et des frais de port avant le renseignement de l'adresse postale du client (recommandation légale imposée par certains pays), mais elle n'est nativement pas stockée dans les bases de données beBOP.
En revanche, les services fiscaux et frontaliers peuvent exiger dans certains pays un nombre de preuves justifiant le paiement de la TVA par le client qui n'est pas celle du pays du vendeur. En ce cas, beBOP propose certaines options (sans pour autant les encourager nativement).
A noter que l'IP est considérée comme une donnée de facturation valide dans certains pays, et que le vendeur n'est pas responsable de l'adresse IP poussée par le navigateur du client.

## Quel régime de TVA choisir ?

Le régime de TVA de votre entreprise peut dépendre :
- du statut de votre entreprise
- de votre type d'activité
- de votre chiffre d'affaire annuel
- d'autres subtilités légales et administratives

Le plus sur est de consulter votre comptable, avocat ou service aux entreprises compétent afin de connaître votre régime de TVA cible et le configurer dans beBOP.
