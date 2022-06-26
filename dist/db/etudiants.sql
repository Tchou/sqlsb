-- BASE DE DONNÉES DES ÉTUDIANTS
-- LES DONNÉES DES NOMS DE MATIÈRES ET PARCOURS SONT TIRÉS
-- DES PARCOURS DE LICENCE DE L'UNIVERSITÉ PARIS-SACLAY
-- LES NOMS D'ÉTUDIANTS SONT GÉNÉRÉS ALÉATOIREMENT À PARTIR
-- DE COMBINAISONS 1000 NOMS ET PRÉNOMS LES PLUS PORTÉS EN FRANCE.
-- TOUTE RESSEMBLANCE AVEC UNE PERSONNE RÉELLE SERAIT FORTUITE.

-- ÉTUDIANTS ET LEURS MOYENNE NOTES EN INFORMATIQUE
SELECT E.*, AVG(S.note)
                   FROM Etudiant AS E
                   JOIN Suit AS S ON S.numero = E.numero
                   JOIN Matiere AS M ON S.codem = M.codem
                   WHERE M.intitule = 'Informatique'
                   GROUP BY E.numero
                   ORDER BY E.nom, E.prenom;
