# sqlsb

`sqlsb` is a companion online SQL evaluator to the french book [Informatique MP2I/MPI](https://www.informatique-mpi.fr/) (Ellipses 2022).
It features a set of preloaded databases (most strings are in french) and is based on [sql.js](https://sql.js.org/).

You can try it [here](https://tchou.github.io/sqlsb/?lang=en).

A single file implementation is available
[here](https://tchou.github.io/sqlsb/sqlsb.html). You can download
this file and open it locally with your web browser.  It does not
require anything else, not even a web server.

### Keyboard and mouse shortcuts
- `ctrl-Enter`: evaluate the content of the editor
- `ctrl-shift-↑`: move backward in the history
- `ctrl-shift-↓`: move forward in the history
- `click` (left button) on a SQL statement result: copy the text of the
    statement in the editor
- `ctrl-click` (left button) on a SQL statement result: evaluate the statement again
- `click` (left button) on a table action (SCHEMA, VALUES, SIZE, DROP): evaluate the predefined SQL statement for that table.

---
`sqlsb` est l'évaluateur SQL en ligne qui accompagne le livre [Informatique MP2I/MPI](https://www.informatique-mpi.fr/) (Ellipses 2022).
Les exemples du livres sont pré-chargés. L'outil est basé sur [sql.js](https://sql.js.org/).

Vous pouvez l'essayer [ici](https://tchou.github.io/sqlsb/?lang=fr).

Une implémentation dans un seul fichier est disponible
[ici](https://tchou.github.io/sqlsb/sqlsb.html). Vous pouvez
enregistrer ce fichier et l'ouvrir avec votre navigateur Web. Cette
version ne nécessite rien d'autre, pas même un serveur Web.
### Raccourcis clavier et souris
- `ctrl-Entrée` : évalue le contenu de l'éditeur
- `ctrl-shift-↑` : revenir dans l'historique
- `ctrl-shift-↓` : avancer dans l'historique
- `click` (bouton gauche) sur un résultat d'ordre SQL : recopie le texte de l'ordre SQL dans l'éditeur
- `ctrl-click` (bouton de gauche) sur un résultat d'ordre SQL  : réévalue l'ordre SQL
- `click` (bouton gauche) sur une action de table (SCHÉMA, VALEURS, TAILLE, SUPPRIMER) : évalue l'ordre SQL prédéfini pour cette action sur la table donnée.
